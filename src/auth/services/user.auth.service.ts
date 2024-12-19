import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { UserRole } from 'src/common/enums/user-role.enum';
import { UserRefreshTokensService } from 'src/refresh-tokens/services/user.refresh-tokens.service';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import { UsersService } from 'src/users/users.service';
import { LoginDto } from '../dtos/login.dto';
import { RegisterUserDto } from '../dtos/register-user.dto';
import { UserProfileSerializer } from '../serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from '../types/login.response.type';
import { AbstractAuthService } from './abstract.auth.service';

@Injectable()
export class UserAuthService extends AbstractAuthService {
  constructor(
    private readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly userRefreshTokenService: UserRefreshTokensService,
  ) {
    super(configService, {
      refreshTokenPath: '/auth/refresh',
    });
  }

  async register(userData: RegisterUserDto): Promise<UserProfileSerializer> {
    return this.userService.register(userData);
  }

  async webLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<WebLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const user = await this.userService.validateUserLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = user;
    const jwtPayload = { sub: _id, role: UserRole.USER };
    const accessToken = this.jwtService.sign(jwtPayload);
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.userRefreshTokenService.generateRefreshToken({
        ...uaPayload,
        user: _id.toHexString(),
        expiresAt: refreshCookieExpiryDateTime,
      });
    this.setAuthCookies({ accessToken, refreshToken }, response);
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

  async mobileLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
  ): Promise<MobileLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const user = await this.userService.validateUserLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = user;
    const jwtPayload = { sub: _id, role: UserRole.USER };
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.userRefreshTokenService.generateRefreshToken({
        ...uaPayload,
        user: _id.toHexString(),
        expiresAt: refreshCookieExpiryDateTime,
      });
    const userData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      refreshToken,
      accessToken: this.jwtService.sign(jwtPayload),
      data: userData,
    };
  }

  // NOTE: No need to validate the refresh token and user because it is already done by the JWTRefreshAuthGuard
  async refreshWeb(
    refreshTokenId: string,
    userId: string,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<void> {
    const jwtPayload = { sub: userId, role: UserRole.USER };
    const accessToken = this.jwtService.sign(jwtPayload);
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.userRefreshTokenService.regenerateRefreshToken(
        refreshTokenId,
        {
          ...uaPayload,
          user: userId,
          expiresAt: refreshCookieExpiryDateTime,
        },
      );
    this.setAuthCookies({ accessToken, refreshToken }, response);
  }

  async refreshMobile(
    refreshTokenId: string,
    userId: string,
    uaPayload: UAPayload,
  ) {
    const jwtPayload = { sub: userId, role: UserRole.USER };
    const accessToken = this.jwtService.sign(jwtPayload);
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.userRefreshTokenService.regenerateRefreshToken(
        refreshTokenId,
        {
          ...uaPayload,
          user: userId,
          expiresAt: refreshCookieExpiryDateTime,
        },
      );
    return {
      refreshToken,
      accessToken,
    };
  }

  async getProfile(id: string): Promise<UserProfileSerializer> {
    return this.userService.getUserProfile(id);
  }
}
