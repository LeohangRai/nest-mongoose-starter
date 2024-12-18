import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AdminsService } from 'src/admins/admins.service';
import { LoginDto } from './dtos/login.dto';
import { AdminProfileSerializer } from './serializers/admin-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly adminService: AdminsService,
  ) {}

  async webLogin(
    loginPayload: LoginDto,
    response: Response,
  ): Promise<WebLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const admin = await this.adminService.validateLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = admin;
    const jwtPayload = { username, sub: _id };
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
    const adminData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      data: adminData,
    };
  }

  async mobileLogin(loginPayload: LoginDto): Promise<MobileLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const admin = await this.adminService.validateLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = admin;
    const jwtPayload = { username, sub: _id };
    const adminData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      access_token: this.jwtService.sign(jwtPayload),
      data: adminData,
    };
  }

  async getProfile(id: string): Promise<AdminProfileSerializer> {
    return this.adminService.getProfile(id);
  }
}
