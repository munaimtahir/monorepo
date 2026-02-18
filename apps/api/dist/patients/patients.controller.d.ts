import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/create-patient.dto';
export declare class PatientsController {
    private readonly service;
    constructor(service: PatientsService);
    create(dto: CreatePatientDto): Promise<any>;
    findAll(page?: number, query?: string): Promise<{
        data: any;
        total: any;
    }>;
}
