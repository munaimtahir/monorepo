import { NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from '../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';
export declare class TenantContextMiddleware implements NestMiddleware {
    private readonly prisma;
    private readonly cls;
    private readonly logger;
    constructor(prisma: PrismaService, cls: ClsService);
    use(req: Request, res: Response, next: NextFunction): Promise<void>;
}
