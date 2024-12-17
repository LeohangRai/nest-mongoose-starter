import {
  Body,
  Controller,
  Get,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiTags } from '@nestjs/swagger';
import { GetUser } from 'src/common/decorators/get-user.decorator';
import { RequestUser } from 'src/common/types/request-user.type';
import { AuthService } from './auth.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  async register(@Body() userData: RegisterUserDto) {
    return this.authService.register(userData);
  }

  @Post('login')
  async login(@Body() loginData: LoginDto) {
    const { username, password } = loginData;
    const user = await this.authService.validateUserLoginDetails(
      username,
      password,
    );
    if (!user) {
      throw new UnauthorizedException({
        message: 'Invalid credentials',
      });
    }
    return this.authService.login(user);
  }

  @ApiBearerAuth()
  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@GetUser() user: RequestUser) {
    return this.authService.getUserProfile(user.userId);
  }
}
