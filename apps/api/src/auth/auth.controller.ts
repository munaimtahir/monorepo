import { Controller, Post, Body, HttpCode, HttpStatus, UnauthorizedException, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

import { TenantGuard } from '../common/guards/tenant.guard';

@Controller('auth')
@UseGuards(TenantGuard)
export class AuthController {
    constructor(private authService: AuthService) { }

    @HttpCode(HttpStatus.OK)
    @Post('login')
    async login(@Body() loginDto: LoginDto) {
        // We expect header x-tenant-id for context or pass internal tenant lookup
        // Since login handles tenant scoping, we use the DTO email
        // But email is only unique per tenant.
        // So client MUST send x-tenant-id Header.
        // Or we allow email + tenantId in body?
        // Let's assume header for Phase 0.
        return this.authService.login(loginDto.email, loginDto.password);
    }
}
