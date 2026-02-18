import { ClsService } from 'nestjs-cls';
import { PrismaService } from '../prisma/prisma.service';
import { CreatePatientDto } from './dto/create-patient.dto';
export declare class PatientsService {
    private readonly prisma;
    private readonly cls;
    constructor(prisma: PrismaService, cls: ClsService);
    private get tenantId();
    create(dto: CreatePatientDto): Promise<any>;
    findAll(page: number, query?: string): Promise<{
        data: any;
        total: any;
    }>;
}
