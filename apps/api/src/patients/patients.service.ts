import { Injectable } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';

@Injectable()
export class PatientsService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly cls: ClsService,
    ) { }

    private get tenantId() {
        return this.cls.get('TENANT_ID');
    }

    async create(dto: CreatePatientDto) {
        return this.prisma.patient.create({
            data: {
                ...dto,
                tenantId: this.tenantId,
            },
        });
    }

    async findAll() {
        return this.prisma.patient.findMany({
            where: { tenantId: this.tenantId },
        });
    }
}
