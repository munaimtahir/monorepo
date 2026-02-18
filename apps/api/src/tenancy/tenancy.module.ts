import { Module } from '@nestjs/common';
import { TenancyService } from './tenancy.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
    imports: [PrismaModule],
    providers: [TenancyService],
    exports: [TenancyService],
})
export class TenancyModule { }
