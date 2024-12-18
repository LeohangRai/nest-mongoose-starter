import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { Response } from 'express';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequestUser } from 'src/common/types/request-user.type';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { UserProfileSerializer } from './serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(
    @Body() userData: RegisterUserDto,
  ): Promise<UserProfileSerializer> {
    return this.authService.register(userData);
  }

  @Post('login/web')
  async webLogin(
    @Body() loginData: LoginDto,
    @Res({ passthrough: true }) res: Response,
  ): Promise<WebLoginResponse> {
    return this.authService.webLogin(loginData, res);
  }

  @Post('login/mobile')
  async mobileLogin(@Body() loginData: LoginDto): Promise<MobileLoginResponse> {
    return this.authService.mobileLogin(loginData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: RequestUser): Promise<UserProfileSerializer> {
    return this.authService.getUserProfile(user.userId);
  }
}
