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
import { AuthService } from './auth.service';
import { AllowRoles } from './decorators/allow-roles.decorator';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RBACGuard } from './guards/rbac.guard';
import { UserProfileSerializer } from './serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

@ApiTags('auth (users)')
@Controller('auth')
export class AuthController extends AbstractAuthController {
  constructor(private readonly authService: AuthService) {
    super();
  }

  @Post('register')
  async register(
    @Body() userData: RegisterUserDto,
  ): Promise<UserProfileSerializer> {
    return this.authService.register(userData);
  }

  @Post('login/web')
  async webLogin(
    @Body() loginData: LoginDto,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebLoginResponse> {
    const uaPayload = this.getUaPayload(req);
    return this.authService.webLogin(loginData, uaPayload, res);
  }

  @Post('login/mobile')
  async mobileLogin(
    @Body() loginData: LoginDto,
    @Req() req: Request,
  ): Promise<MobileLoginResponse> {
    const uaPayload = this.getUaPayload(req);
    return this.authService.mobileLogin(loginData, uaPayload);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RBACGuard)
  @AllowRoles(UserRole.USER)
  @Get('profile')
  getProfile(@GetUser() user: RequestUser): Promise<UserProfileSerializer> {
    return this.authService.getProfile(user.userId);
  }
}
