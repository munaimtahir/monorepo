import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class TenantGuard implements CanActivate {
    constructor(private readonly cls: ClsService) { }

    canActivate(context: ExecutionContext): boolean {
        const request = context.switchToHttp().getRequest();
        // Simplistic extraction: Header > User > Query
        const tenantId = request.headers['x-tenant-id'] || request.user?.tenantId || request.query?.tenantId;

        if (!tenantId) {
            throw new UnauthorizedException('Tenant Context Required (x-tenant-id header)');
        }

        this.cls.set('TENANT_ID', tenantId);
        return true;
    }
}
