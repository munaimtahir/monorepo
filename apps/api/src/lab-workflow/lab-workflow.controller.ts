import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AddTestToEncounterDto } from './dto/add-test-to-encounter.dto';
import { EnterLabResultsDto } from './dto/enter-lab-results.dto';
import { VerifyLabResultsDto } from './dto/verify-lab-results.dto';
import { LabWorkflowService } from './lab-workflow.service';

@Controller('encounters')
@UseGuards(TenantGuard)
export class LabWorkflowController {
  constructor(private readonly service: LabWorkflowService) {}

  @Post(':id\\:lab-add-test')
  @HttpCode(HttpStatus.OK)
  addTestToEncounter(
    @Param('id') encounterId: string,
    @Body() dto: AddTestToEncounterDto,
  ) {
    return this.service.addTestToEncounter(encounterId, dto);
  }

  @Get(':id/lab-tests')
  listEncounterLabTests(@Param('id') encounterId: string) {
    return this.service.listEncounterLabTests(encounterId);
  }

  @Post(':id\\:lab-enter-results')
  @HttpCode(HttpStatus.OK)
  enterResults(
    @Param('id') encounterId: string,
    @Body() dto: EnterLabResultsDto,
  ) {
    return this.service.enterResults(encounterId, dto);
  }

  @Post(':id\\:lab-verify')
  @HttpCode(HttpStatus.OK)
  verifyResults(
    @Param('id') encounterId: string,
    @Body() dto: VerifyLabResultsDto,
  ) {
    return this.service.verifyResults(encounterId, dto);
  }

  @Post(':id\\:lab-publish')
  @HttpCode(HttpStatus.OK)
  publishLabReport(@Param('id') encounterId: string) {
    return this.service.publishLabReport(encounterId);
  }
}
