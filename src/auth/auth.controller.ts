import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { ApiRefreshTokenHeader } from 'src/common/decorators/swagger/api.refresh-token.header.decorator';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RefreshRequestUser } from 'src/common/types/refresh-request-user.type';
import { RequestUser } from 'src/common/types/request-user.type';
import { AbstractAuthController } from './abstract.auth.controller';
import { AuthService } from './auth.service';
import { AllowRoles } from './decorators/allow-roles.decorator';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { JwtRefreshAuthGuard } from './guards/jwt-refresh.auth.guard';
import { RBACGuard } from './guards/rbac.guard';
import { UserProfileSerializer } from './serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  MobileRefreshResponse,
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

  @Post('/refresh/web')
  @UseGuards(JwtRefreshAuthGuard, RBACGuard)
  @AllowRoles(UserRole.USER)
  @HttpCode(HttpStatus.NO_CONTENT)
  async refreshWeb(
    @GetUser() user: RefreshRequestUser,
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ) {
    const uaPayload = this.getUaPayload(req);
    return this.authService.refreshWeb(
      user.refreshTokenId,
      user.userId,
      uaPayload,
      res,
    );
  }

  @Post('/refresh/mobile')
  @ApiRefreshTokenHeader()
  @UseGuards(JwtRefreshAuthGuard, RBACGuard)
  @AllowRoles(UserRole.USER)
  async refreshMobile(
    @GetUser() user: RefreshRequestUser,
    @Req() req: Request,
  ): Promise<MobileRefreshResponse> {
    const uaPayload = this.getUaPayload(req);
    return this.authService.refreshMobile(
      user.refreshTokenId,
      user.userId,
      uaPayload,
    );
  }

  @Get('profile')
  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard, RBACGuard)
  @AllowRoles(UserRole.USER)
  getProfile(@GetUser() user: RequestUser): Promise<UserProfileSerializer> {
    return this.authService.getProfile(user.id);
  }
}
