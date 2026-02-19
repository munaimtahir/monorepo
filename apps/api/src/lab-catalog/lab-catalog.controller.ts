import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { TenantGuard } from '../common/guards/tenant.guard';
import { AddParameterDto } from './dto/add-parameter.dto';
import { CreateTestDto } from './dto/create-test.dto';
import { LabCatalogService } from './lab-catalog.service';

@Controller('lab/tests')
@UseGuards(TenantGuard)
export class LabCatalogController {
  constructor(private readonly service: LabCatalogService) {}

  @Post()
  createTest(@Body() dto: CreateTestDto) {
    return this.service.createTest(dto);
  }

  @Get()
  listTests() {
    return this.service.listTests();
  }

  @Get(':testId')
  getTestById(@Param('testId') testId: string) {
    return this.service.getTestById(testId);
  }

  @Post(':testId/parameters')
  addParameter(@Param('testId') testId: string, @Body() dto: AddParameterDto) {
    return this.service.addParameter(testId, dto);
  }

  @Get(':testId/parameters')
  listParameters(@Param('testId') testId: string) {
    return this.service.listParameters(testId);
  }
}
