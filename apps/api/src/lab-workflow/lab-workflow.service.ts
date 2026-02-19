import {
  LabOrderItemStatus,
  LabResultFlag,
  Prisma,
  type LabOrderItem,
  type LabResultItem,
  type LabTestDefinition,
  type LabTestParameter,
} from '@prisma/client';
import {
  Inject,
  Injectable,
  NotFoundException,
  Scope,
  UnauthorizedException,
} from '@nestjs/common';
import { REQUEST } from '@nestjs/core';
import type { Request } from 'express';
import { ClsService } from 'nestjs-cls';
import { DomainException } from '../common/errors/domain.exception';
import { DocumentsService } from '../documents/documents.service';
import { PrismaService } from '../prisma/prisma.service';
import { AddTestToEncounterDto } from './dto/add-test-to-encounter.dto';
import { EnterLabResultsDto } from './dto/enter-lab-results.dto';
import { VerifyLabResultsDto } from './dto/verify-lab-results.dto';

type LabOrderedTestResponse = {
  orderItem: LabOrderItem;
  test: LabTestDefinition;
  parameters: LabTestParameter[];
  results: LabResultItem[];
};

@Injectable({ scope: Scope.REQUEST })
export class LabWorkflowService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cls: ClsService,
    private readonly documentsService: DocumentsService,
    @Inject(REQUEST) private readonly request: Request,
  ) {}

  private get tenantId(): string {
    const tenantId = this.cls.get<string>('TENANT_ID');
    if (!tenantId) {
      throw new UnauthorizedException('Tenant context missing');
    }
    return tenantId;
  }

  async addTestToEncounter(encounterId: string, dto: AddTestToEncounterDto) {
    const tenantId = this.tenantId;

    return this.prisma.$transaction(async (tx) => {
      const encounter = await this.assertLabEncounter(tx, encounterId);

      if (encounter.status === 'FINALIZED' || encounter.status === 'DOCUMENTED') {
        throw new DomainException(
          'ENCOUNTER_STATE_INVALID',
          'Cannot add LAB tests after encounter finalization',
        );
      }

      const test = await tx.labTestDefinition.findFirst({
        where: {
          id: dto.testId,
          tenantId,
          active: true,
        },
      });

      if (!test) {
        throw new DomainException(
          'LAB_TEST_NOT_FOUND',
          'LAB test is not available for this tenant',
        );
      }

      try {
        const orderItem = await tx.labOrderItem.create({
          data: {
            tenantId,
            encounterId: encounter.id,
            testId: test.id,
            status: LabOrderItemStatus.ORDERED,
          },
        });

        const activeParameters = await tx.labTestParameter.findMany({
          where: {
            tenantId,
            testId: test.id,
            active: true,
          },
          orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
        });

        if (activeParameters.length > 0) {
          await tx.labResultItem.createMany({
            data: activeParameters.map((parameter) => ({
              tenantId,
              orderItemId: orderItem.id,
              parameterId: parameter.id,
              value: '',
              flag: LabResultFlag.UNKNOWN,
            })),
          });
        }

        return this.buildOrderedTest(tx, orderItem.id);
      } catch (error) {
        if (
          error instanceof Prisma.PrismaClientKnownRequestError &&
          error.code === 'P2002'
        ) {
          throw new DomainException(
            'LAB_TEST_ALREADY_ORDERED',
            'This LAB test is already ordered for the encounter',
          );
        }

        throw error;
      }
    });
  }

  async listEncounterLabTests(encounterId: string) {
    const tenantId = this.tenantId;

    return this.prisma.$transaction(async (tx) => {
      await this.assertLabEncounter(tx, encounterId);

      const orderItems = await tx.labOrderItem.findMany({
        where: {
          tenantId,
          encounterId,
        },
        orderBy: [{ createdAt: 'asc' }, { id: 'asc' }],
        select: {
          id: true,
        },
      });

      const data = await Promise.all(
        orderItems.map((orderItem) => this.buildOrderedTest(tx, orderItem.id)),
      );

      return {
        data,
        total: data.length,
      };
    });
  }

  async enterResults(encounterId: string, dto: EnterLabResultsDto) {
    const tenantId = this.tenantId;
    const actor = this.getActorIdentity();

    return this.prisma.$transaction(async (tx) => {
      const encounter = await this.assertLabEncounter(tx, encounterId);

      if (encounter.status !== 'IN_PROGRESS') {
        throw new DomainException(
          'INVALID_STATE',
          'LAB results can only be entered while encounter is IN_PROGRESS',
        );
      }

      const orderItem = await tx.labOrderItem.findFirst({
        where: {
          id: dto.orderItemId,
          tenantId,
          encounterId: encounter.id,
        },
      });

      if (!orderItem) {
        throw new NotFoundException('LAB order item not found');
      }

      if (orderItem.status === LabOrderItemStatus.VERIFIED) {
        throw new DomainException(
          'LAB_RESULTS_LOCKED',
          'Cannot edit results after verification',
        );
      }

      const activeParameters = await tx.labTestParameter.findMany({
        where: {
          tenantId,
          testId: orderItem.testId,
          active: true,
        },
      });
      const parameterById = new Map(activeParameters.map((item) => [item.id, item]));

      for (const result of dto.results) {
        const parameter = parameterById.get(result.parameterId);
        if (!parameter) {
          throw new DomainException(
            'LAB_PARAMETER_NOT_FOUND',
            'One or more parameters do not belong to the ordered test',
          );
        }

        const normalizedValue = result.value.trim();
        const valueNumeric = this.parseNumericValue(normalizedValue);
        const flag = this.computeFlag(parameter, valueNumeric);

        await tx.labResultItem.upsert({
          where: {
            tenantId_orderItemId_parameterId: {
              tenantId,
              orderItemId: orderItem.id,
              parameterId: parameter.id,
            },
          },
          create: {
            tenantId,
            orderItemId: orderItem.id,
            parameterId: parameter.id,
            value: normalizedValue,
            valueNumeric,
            flag,
            enteredBy: actor,
            enteredAt: new Date(),
          },
          update: {
            value: normalizedValue,
            valueNumeric,
            flag,
            enteredBy: actor,
            enteredAt: new Date(),
            verifiedBy: null,
            verifiedAt: null,
          },
        });
      }

      const allValues = await tx.labResultItem.findMany({
        where: {
          tenantId,
          orderItemId: orderItem.id,
          parameterId: {
            in: activeParameters.map((parameter) => parameter.id),
          },
        },
      });

      const allRequiredValuesPresent = activeParameters.every((parameter) => {
        const value = allValues.find((item) => item.parameterId === parameter.id);
        return Boolean(value && value.value.trim().length > 0);
      });

      await tx.labOrderItem.update({
        where: {
          id: orderItem.id,
        },
        data: {
          status: allRequiredValuesPresent
            ? LabOrderItemStatus.RESULTS_ENTERED
            : LabOrderItemStatus.ORDERED,
        },
      });

      return this.buildOrderedTest(tx, orderItem.id);
    });
  }

  async verifyResults(encounterId: string, dto: VerifyLabResultsDto) {
    const tenantId = this.tenantId;
    const actor = this.getActorIdentity() ?? 'system';

    return this.prisma.$transaction(async (tx) => {
      const encounter = await this.assertLabEncounter(tx, encounterId);

      if (encounter.status !== 'IN_PROGRESS') {
        throw new DomainException(
          'INVALID_STATE',
          'LAB results can only be verified while encounter is IN_PROGRESS',
        );
      }

      const orderItem = await tx.labOrderItem.findFirst({
        where: {
          id: dto.orderItemId,
          tenantId,
          encounterId: encounter.id,
        },
      });

      if (!orderItem) {
        throw new NotFoundException('LAB order item not found');
      }

      if (orderItem.status !== LabOrderItemStatus.RESULTS_ENTERED) {
        throw new DomainException(
          'LAB_RESULTS_NOT_READY',
          'LAB order item must be in RESULTS_ENTERED status before verification',
        );
      }

      const activeParameters = await tx.labTestParameter.findMany({
        where: {
          tenantId,
          testId: orderItem.testId,
          active: true,
        },
        select: {
          id: true,
        },
      });

      const activeParameterIds = activeParameters.map((parameter) => parameter.id);
      const values = await tx.labResultItem.findMany({
        where: {
          tenantId,
          orderItemId: orderItem.id,
          parameterId: {
            in: activeParameterIds,
          },
        },
      });

      const complete = activeParameterIds.every((parameterId) => {
        const value = values.find((item) => item.parameterId === parameterId);
        return Boolean(value && value.value.trim().length > 0);
      });

      if (!complete) {
        throw new DomainException(
          'LAB_RESULTS_INCOMPLETE',
          'All active parameters must have values before verification',
        );
      }

      const verifiedAt = new Date();
      await tx.labResultItem.updateMany({
        where: {
          tenantId,
          orderItemId: orderItem.id,
          parameterId: {
            in: activeParameterIds,
          },
        },
        data: {
          verifiedBy: actor,
          verifiedAt,
        },
      });

      await tx.labOrderItem.update({
        where: {
          id: orderItem.id,
        },
        data: {
          status: LabOrderItemStatus.VERIFIED,
        },
      });

      return this.buildOrderedTest(tx, orderItem.id);
    });
  }

  async publishLabReport(encounterId: string) {
    const encounter = await this.prisma.encounter.findFirst({
      where: {
        id: encounterId,
        tenantId: this.tenantId,
      },
      select: {
        id: true,
        type: true,
        status: true,
      },
    });

    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }

    if (encounter.type !== 'LAB') {
      throw new DomainException(
        'INVALID_ENCOUNTER_TYPE',
        'LAB workflow commands are only valid for LAB encounters',
      );
    }

    if (encounter.status !== 'FINALIZED' && encounter.status !== 'DOCUMENTED') {
      throw new DomainException(
        'ENCOUNTER_STATE_INVALID',
        'Encounter must be FINALIZED before LAB report publishing',
      );
    }

    return this.documentsService.queueEncounterDocument(encounter.id, 'LAB_REPORT_V1');
  }

  private async assertLabEncounter(
    tx: Prisma.TransactionClient,
    encounterId: string,
  ) {
    const encounter = await tx.encounter.findFirst({
      where: {
        id: encounterId,
        tenantId: this.tenantId,
      },
    });

    if (!encounter) {
      throw new NotFoundException('Encounter not found');
    }

    if (encounter.type !== 'LAB') {
      throw new DomainException(
        'INVALID_ENCOUNTER_TYPE',
        'LAB workflow commands are only valid for LAB encounters',
      );
    }

    return encounter;
  }

  private async buildOrderedTest(
    tx: Prisma.TransactionClient,
    orderItemId: string,
  ): Promise<LabOrderedTestResponse> {
    const tenantId = this.tenantId;

    const orderItem = await tx.labOrderItem.findFirst({
      where: {
        id: orderItemId,
        tenantId,
      },
      include: {
        test: true,
      },
    });

    if (!orderItem) {
      throw new NotFoundException('LAB order item not found');
    }

    const parameters = await tx.labTestParameter.findMany({
      where: {
        tenantId,
        testId: orderItem.testId,
        active: true,
      },
      orderBy: [{ displayOrder: 'asc' }, { name: 'asc' }],
    });

    const orderMap = new Map(parameters.map((parameter, index) => [parameter.id, index]));

    const results = await tx.labResultItem.findMany({
      where: {
        tenantId,
        orderItemId: orderItem.id,
      },
    });

    results.sort((left, right) => {
      const leftOrder = orderMap.get(left.parameterId) ?? Number.MAX_SAFE_INTEGER;
      const rightOrder = orderMap.get(right.parameterId) ?? Number.MAX_SAFE_INTEGER;
      if (leftOrder !== rightOrder) {
        return leftOrder - rightOrder;
      }
      return left.parameterId.localeCompare(right.parameterId);
    });

    const { test, ...orderItemWithoutTest } = orderItem;

    return {
      orderItem: orderItemWithoutTest,
      test,
      parameters,
      results,
    };
  }

  private parseNumericValue(value: string): number | null {
    if (value.length === 0) {
      return null;
    }

    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  private computeFlag(
    parameter: LabTestParameter,
    valueNumeric: number | null,
  ): LabResultFlag {
    if (valueNumeric === null) {
      return LabResultFlag.UNKNOWN;
    }

    if (parameter.refLow !== null && valueNumeric < parameter.refLow) {
      return LabResultFlag.LOW;
    }

    if (parameter.refHigh !== null && valueNumeric > parameter.refHigh) {
      return LabResultFlag.HIGH;
    }

    if (parameter.refLow !== null || parameter.refHigh !== null) {
      return LabResultFlag.NORMAL;
    }

    return LabResultFlag.UNKNOWN;
  }

  private getActorIdentity(): string | null {
    const fromCls =
      this.cls.get<string>('USER_EMAIL') ??
      this.cls.get<string>('USER_ID') ??
      this.cls.get<string>('USER_SUB') ??
      null;
    if (fromCls) {
      return fromCls;
    }

    const authorization = this.request.headers.authorization;
    if (!authorization || !authorization.startsWith('Bearer ')) {
      return null;
    }

    const token = authorization.slice('Bearer '.length).trim();
    if (!token) {
      return null;
    }

    const parts = token.split('.');
    if (parts.length >= 3 && parts[0] === 'mock' && parts[2].length > 0) {
      return parts[2];
    }

    return null;
  }
}
