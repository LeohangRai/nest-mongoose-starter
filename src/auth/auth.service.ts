import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { plainToClass } from 'class-transformer';
import {
  hashPassword,
  isPasswordMatch,
} from 'src/common/helpers/crypto/bcrypt.helper';
import { User, UserWithTimestamps } from 'src/schemas/user.schema';
import { UsersService } from 'src/users/users.service';
import { RegisterUserDto } from './dtos/register-user.dto';
import { LoginResponse } from './serializers/login.response';
import { UserProfileSerializer } from './serializers/user-profile.serializer';

@Injectable()
export class AuthService {
  constructor(
    private readonly userService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  serializeUserProfile(user: Partial<User>) {
    return plainToClass(UserProfileSerializer, user, {
      excludeExtraneousValues: true,
    });
  }

  async register(userData: RegisterUserDto) {
    const { username, email, password } = userData;
    await this.userService.checkWhetherUsernameAndEmailAreUnique(
      username,
      email,
    );
    const user = await this.userService.create({
      ...userData,
      password: hashPassword(password),
    });
    return this.serializeUserProfile(user);
  }

  async validateUserLoginDetails(username: string, inputPassword: string) {
    const user = await this.userService.findByUsername(username);
    if (!user) return null;
    const { password: originalPassword, ...rest } = user;
    if (isPasswordMatch(inputPassword, originalPassword)) return rest;
    return null;
  }

  async login(user: Partial<UserWithTimestamps>): Promise<LoginResponse> {
    const { _id, username, email, gender, profilePic, status } = user;
    const jwtPayload = { username, sub: _id };
    const userData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      access_token: this.jwtService.sign(jwtPayload),
      data: userData,
    };
  }

  async getUserProfile(uuid: string) {
    const userData = await this.userService.getUserProfile(uuid);
    return this.serializeUserProfile(userData);
  }
}
