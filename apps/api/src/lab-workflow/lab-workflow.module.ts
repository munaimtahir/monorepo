import { Module } from '@nestjs/common';
import { DocumentsModule } from '../documents/documents.module';
import { LabWorkflowController } from './lab-workflow.controller';
import { LabWorkflowService } from './lab-workflow.service';

@Module({
  imports: [DocumentsModule],
  controllers: [LabWorkflowController],
  providers: [LabWorkflowService],
})
export class LabWorkflowModule {}
