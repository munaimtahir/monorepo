import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { ClsService } from 'nestjs-cls';

@Injectable()
export class AuthService {
    constructor(private prisma: PrismaService, private cls: ClsService) { }

    async login(email: string, pass: string) {
        const tenantId = this.cls.get('TENANT_ID');
        if (!tenantId) {
            // In a real app we might lookup user by email globally if unique, or ask for tenant.
            // Here we enforce header.
            throw new UnauthorizedException('Tenant ID header missing for login');
        }

        const user = await this.prisma.user.findUnique({
            where: {
                tenantId_email: {
                    tenantId,
                    email,
                },
            },
        });

        if (user?.passwordHash !== pass) { // Plaintext for Phase 0 MVP/Demo
            throw new UnauthorizedException();
        }

        const { passwordHash, ...result } = user;
        // Generate JWT
        return {
            access_token: `mock_token_${user.id}_${tenantId}`,
            user: result,
        };
    }
}
