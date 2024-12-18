import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequestUser } from 'src/common/types/request-user.type';
import { AdminAuthService } from './admin.auth.service';
import { LoginDto } from './dtos/login.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { AdminProfileSerializer } from './serializers/admin-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

@ApiTags('auth (admin)')
@Controller('auth/admin')
export class AdminAuthController {
  constructor(private readonly adminAuthService: AdminAuthService) {}

  @Post('login/web')
  async webLogin(
    @Body() loginData: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebLoginResponse> {
    return this.adminAuthService.webLogin(loginData, res);
  }

  @Post('login/mobile')
  async mobileLogin(@Body() loginData: LoginDto): Promise<MobileLoginResponse> {
    return this.adminAuthService.mobileLogin(loginData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: RequestUser): Promise<AdminProfileSerializer> {
    return this.adminAuthService.getProfile(user.userId);
  }
}
