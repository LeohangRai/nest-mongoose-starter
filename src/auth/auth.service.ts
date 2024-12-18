import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from './dtos/login.dto';
import { RegisterUserDto } from './dtos/register-user.dto';
import { UserProfileSerializer } from './serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly userService: UsersService,
  ) {}

  async register(userData: RegisterUserDto): Promise<UserProfileSerializer> {
    return this.userService.register(userData);
  }

  async webLogin(
    loginPayload: LoginDto,
    response: Response,
  ): Promise<WebLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const user = await this.userService.validateUserLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = user;
    const jwtPayload = { username, sub: _id, role: UserRole.USER };
    const accessToken = this.jwtService.sign(jwtPayload);
    const cookieExpiryDateTime = new Date();
    cookieExpiryDateTime.setMilliseconds(
      cookieExpiryDateTime.getTime() +
        Number(this.configService.get<string>('jwt.expiresIn')) * 1000, // convert seconds to milliseconds
    );
    response.cookie('Authentication', accessToken, {
      httpOnly: true,
      secure: this.configService.get('app.env') === 'production',
      expires: cookieExpiryDateTime,
    });
    const userData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      data: userData,
    };
  }

  async mobileLogin(loginPayload: LoginDto): Promise<MobileLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const user = await this.userService.validateUserLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = user;
    const jwtPayload = { username, sub: _id, role: UserRole.USER };
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

  async getUserProfile(id: string): Promise<UserProfileSerializer> {
    return this.userService.getUserProfile(id);
  }
}
