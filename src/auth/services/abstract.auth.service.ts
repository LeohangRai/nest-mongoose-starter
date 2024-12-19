import { ConfigService } from '@nestjs/config';
import { Response } from 'express';
import { CustomCookieOptions } from 'src/common/types/custom-cookie.options.type';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import { DEFAULT_COOKIE_OPTIONS } from '../constants/default-cookie-options';
import { LoginDto } from '../dtos/login.dto';
import { CookieKey } from '../enums/cookie-key.enum';
import { AdminProfileSerializer } from '../serializers/admin-profile.serializer';
import { UserProfileSerializer } from '../serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from '../types/login.response.type';

export abstract class AbstractAuthService {
  protected cookieConfig = DEFAULT_COOKIE_OPTIONS;

  constructor(
    protected readonly configService: ConfigService,
    protected cookieOpts: CustomCookieOptions,
  ) {
    const secure = this.configService.get('app.env') === 'production';
    this.cookieConfig = {
      ...this.cookieConfig,
      ...cookieOpts,
      secure,
    };
  }

  /**
   * handle web login process
   * @param loginPayload - Login credentials
   * @param uaPayload - User agent information
   * @param response - Express response object
   * @returns Promise<WebLoginResponse>
   */
  abstract webLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
    response: Response,
  ): Promise<WebLoginResponse>;

  /**
   * handle mobile login process
   * @param loginPayload - Login credentials
   * @param uaPayload - User agent information
   * @returns Promise<MobileLoginResponse>
   */
  abstract mobileLogin(
    loginPayload: LoginDto,
    uaPayload: UAPayload,
  ): Promise<MobileLoginResponse>;

  /**
   * get the profile of a user/admin
   * @param id - ID of the user/admin
   * @returns Promise<AdminProfileSerializer | UserProfileSerializer>
   */
  abstract getProfile(
    id: string,
  ): Promise<AdminProfileSerializer | UserProfileSerializer>;

  /**
   * get the expiry date and time for auth and refresh cookies
   * @returns an object with two properties: `authCookieExpiryDateTime` and `refreshCookieExpiryDateTime`
   */
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

  /**
   * sets authentication cookies for access and refresh tokens.
   *
   * @param tokens - An object containing the access and refresh tokens.
   * @param response - Express response object to set the cookies on.
   *
   * - The access token cookie is configured with default cookie options and set to expire at the auth cookie expiry time.
   * - The refresh token cookie is configured with default cookie options but uses a specific path for the refresh token and expires at the refresh cookie expiry time.
   */
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
      ...this.cookieConfig,
      expires: authCookieExpiryDateTime,
    });
    response.cookie(CookieKey.RefreshToken, refreshToken, {
      ...this.cookieConfig,
      path: this.cookieConfig.refreshTokenPath || this.cookieConfig.path,
      expires: refreshCookieExpiryDateTime,
    });
  }
}
