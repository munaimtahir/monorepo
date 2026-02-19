import { Module } from '@nestjs/common';
import { LabCatalogController } from './lab-catalog.controller';
import { LabCatalogService } from './lab-catalog.service';

@Module({
  controllers: [LabCatalogController],
  providers: [LabCatalogService],
  exports: [LabCatalogService],
})
export class LabCatalogModule {}
