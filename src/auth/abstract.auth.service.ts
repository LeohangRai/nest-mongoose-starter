import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import { LoginDto } from './dtos/login.dto';
import { CookieKey } from './enums/cookie-key.enum';
import { AdminProfileSerializer } from './serializers/admin-profile.serializer';
import { UserProfileSerializer } from './serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

export abstract class AbstractAuthService {
  constructor(protected readonly configService: ConfigService) {}

  abstract webLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<WebLoginResponse>;

  abstract mobileLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
  ): Promise<MobileLoginResponse>;

  abstract getProfile(
    id: string,
  ): Promise<AdminProfileSerializer | UserProfileSerializer>;

  protected getCookiesExpiryDateTime(): {
    authCookieExpiryDateTime: Date;
    refreshCookieExpiryDateTime: Date;
  } {
    const authCookieExpiryDateTime = new Date();
    const authCookieExpiresIn =
      this.configService.getOrThrow<number>('jwt.expiresIn');
    authCookieExpiryDateTime.setSeconds(
      authCookieExpiryDateTime.getSeconds() + authCookieExpiresIn,
    );

    const refreshCookieExpiryDateTime = new Date();
    const refreshCookieExpiresIn = this.configService.getOrThrow<number>(
      'jwt.refreshTokenExpiresIn',
    );
    refreshCookieExpiryDateTime.setSeconds(
      refreshCookieExpiryDateTime.getSeconds() + refreshCookieExpiresIn,
    );
    return { authCookieExpiryDateTime, refreshCookieExpiryDateTime };
  }

  protected setAuthCookies(
    tokens: {
      accessToken: string;
      refreshToken: string;
    },
    response: Response,
  ): void {
    const { accessToken, refreshToken } = tokens;
    const { authCookieExpiryDateTime, refreshCookieExpiryDateTime } =
      this.getCookiesExpiryDateTime();
    response.cookie(CookieKey.AccessToken, accessToken, {
      httpOnly: true,
      secure: this.configService.get('app.env') === 'production',
      expires: authCookieExpiryDateTime,
    });
    response.cookie(CookieKey.RefreshToken, refreshToken, {
      httpOnly: true,
      secure: this.configService.get('app.env') === 'production',
      expires: refreshCookieExpiryDateTime,
    });
  }
}
