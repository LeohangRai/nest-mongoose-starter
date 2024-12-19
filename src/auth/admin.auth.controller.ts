import {
  Body,
  Controller,
  Get,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RequestUser } from 'src/common/types/request-user.type';
import { AbstractAuthController } from './abstract.auth.controller';
import { AdminAuthService } from './admin.auth.service';
import { AllowRoles } from './decorators/allow-roles.decorator';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RBACGuard } from './guards/rbac.guard';
import { AdminProfileSerializer } from './serializers/admin-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

@ApiTags('auth (admin)')
@Controller('auth/admin')
export class AdminAuthController extends AbstractAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {
    super();
  }

  @Post('login/web')
  async webLogin(
    @Body() loginData: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebLoginResponse> {
    const uaPayload = this.getUaPayload(req);
    return this.adminAuthService.webLogin(loginData, uaPayload, res);
  }

  @Post('login/mobile')
  async mobileLogin(
    @Body() loginData: LoginDto,
    @Req() req: Request,
  ): Promise<MobileLoginResponse> {
    const uaPayload = this.getUaPayload(req);
    return this.adminAuthService.mobileLogin(loginData, uaPayload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RBACGuard)
  @AllowRoles(UserRole.ADMIN)
  @Get('profile')
  getProfile(@GetUser() user: RequestUser): Promise<AdminProfileSerializer> {
    return this.adminAuthService.getProfile(user.userId);
  }
}
