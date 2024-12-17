import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginResponse } from './serializers/login.response';
import { UserProfileSerializer } from './serializers/user-profile.serializer';

@Injectable()
export class AuthService {
  constructor(private readonly userService: UsersService) {}

  async register(userData: RegisterUserDto): Promise<UserProfileSerializer> {
    return this.userService.register(userData);
  }

  async login(loginPayload: LoginDto): Promise<LoginResponse> {
    return this.userService.login(loginPayload);
  }

  async getUserProfile(uuid: string): Promise<UserProfileSerializer> {
    return this.userService.getUserProfile(uuid);
  }
}
