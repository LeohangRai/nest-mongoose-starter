import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { Response } from 'express';
import { AdminsService } from 'src/admins/admins.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { SignJWTInput } from 'src/common/types/sign-jwt.input.type';
import { AdminRefreshTokensService } from 'src/refresh-tokens/services/admin.refresh-tokens.service';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import { LoginDto } from '../dtos/login.dto';
import { AdminProfileSerializer } from '../serializers/admin-profile.serializer';
import {
  MobileLoginResponse,
  MobileRefreshResponse,
  WebLoginResponse,
} from '../types/login.response.type';
import { AbstractAuthService } from './abstract.auth.service';

@Injectable()
export class AdminAuthService extends AbstractAuthService {
  constructor(
    private readonly jwtService: JwtService,
    protected readonly configService: ConfigService,
    private readonly adminService: AdminsService,
    private readonly adminRefreshTokenService: AdminRefreshTokensService,
  ) {
    super(configService, {
      refreshTokenPath: '/auth/admin',
    });
  }

  async webLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<WebLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const admin = await this.adminService.validateLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = admin;
    const jwtPayload: SignJWTInput = {
      sub: _id.toHexString(),
      role: UserRole.ADMIN,
    };
    const accessToken = this.jwtService.sign(jwtPayload);
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.adminRefreshTokenService.generateRefreshToken({
        ...uaPayload,
        user: _id.toHexString(),
        expiresAt: refreshCookieExpiryDateTime,
      });
    this.setAuthCookies({ accessToken, refreshToken }, response);
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

  async mobileLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
  ): Promise<MobileLoginResponse> {
    const { username: inputUsername, password: inputPassword } = loginPayload;
    const admin = await this.adminService.validateLoginDetails(
      inputUsername,
      inputPassword,
    );
    const { _id, username, email, gender, profilePic, status } = admin;
    const jwtPayload: SignJWTInput = {
      sub: _id.toHexString(),
      role: UserRole.ADMIN,
    };
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.adminRefreshTokenService.generateRefreshToken({
        ...uaPayload,
        user: _id.toHexString(),
        expiresAt: refreshCookieExpiryDateTime,
      });
    const adminData = {
      username,
      email,
      gender,
      profilePic,
      status,
    };
    return {
      refreshToken,
      accessToken: this.jwtService.sign(jwtPayload),
      data: adminData,
    };
  }

  async refreshWeb(
    refreshTokenId: string,
    userId: string,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<void> {
    const jwtPayload: SignJWTInput = { sub: userId, role: UserRole.ADMIN };
    const accessToken = this.jwtService.sign(jwtPayload);
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.adminRefreshTokenService.regenerateRefreshToken(
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
  ): Promise<MobileRefreshResponse> {
    const jwtPayload: SignJWTInput = { sub: userId, role: UserRole.ADMIN };
    const accessToken = this.jwtService.sign(jwtPayload);
    const { refreshCookieExpiryDateTime } = this.getCookiesExpiryDateTime();
    const refreshToken =
      await this.adminRefreshTokenService.regenerateRefreshToken(
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

  async logoutWeb(refreshTokenId: string, response: Response): Promise<void> {
    try {
      await this.adminRefreshTokenService.revokeRefreshToken(refreshTokenId);
    } catch (error) {
      throw error;
    } finally {
      /* clear the cookies even if the revokeRefreshToken() operation fails */
      this.clearAuthCookies(response);
    }
  }

  logoutMobile(refreshTokenId: string): Promise<void> {
    return this.adminRefreshTokenService.revokeRefreshToken(refreshTokenId);
  }

  async getProfile(id: string): Promise<AdminProfileSerializer> {
    return this.adminService.getProfile(id);
  }
}
