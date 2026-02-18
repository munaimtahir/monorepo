import { Controller, Get, Post, Body, UseGuards } from '@nestjs/common';
import { PatientsService } from './patients.service';
import { TenantGuard } from '../common/guards/tenant.guard';
import { CreatePatientDto } from './dto/create-patient.dto'; // Need to create DTO

@Controller('patients')
@UseGuards(TenantGuard)
export class PatientsController {
    constructor(private readonly service: PatientsService) { }

    @Post()
    create(@Body() dto: CreatePatientDto) {
        return this.service.create(dto);
    }

    @Get()
    findAll() {
        return this.service.findAll();
    }
}
