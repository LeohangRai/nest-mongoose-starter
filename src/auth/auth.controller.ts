import { Body, Controller, Get, Post, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequestUser } from 'src/common/types/request-user.type';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LoginResponse } from './serializers/login.response';
import { UserProfileSerializer } from './serializers/user-profile.serializer';

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

  @Post('login')
  async login(@Body() loginData: LoginDto): Promise<LoginResponse> {
    return this.authService.login(loginData);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: RequestUser): Promise<UserProfileSerializer> {
    return this.authService.getUserProfile(user.userId);
  }
}
