import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JWTRefreshPayload } from 'src/common/types/jwt-refresh.payload.type';
import { RefreshRequestUser } from 'src/common/types/refresh-request-user.type';
import { AdminRefreshTokensService } from 'src/refresh-tokens/services/admin.refresh-tokens.service';
import { UserRefreshTokensService } from 'src/refresh-tokens/services/user.refresh-tokens.service';
import { CookieKey } from '../enums/cookie-key.enum';
import { CustomHeader } from '../enums/custom-header.enum';

@Injectable()
export class JwtRefreshStrategy extends PassportStrategy(
  Strategy,
  'jwt-refresh',
) {
  constructor(
    readonly configService: ConfigService,
    private readonly adminRefreshTokenService: AdminRefreshTokensService,
    private readonly userRefreshTokenService: UserRefreshTokensService,
  ) {
    super({
      /* 
        extract the refresh token from either:
        - cookie named 'RefreshToken' (for web)
        - custom header 'x-refresh-token' (for mobile)
      */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.[CookieKey.RefreshToken],
        ExtractJwt.fromHeader(CustomHeader.RefreshToken),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.refreshTokenSecret'),
    });
  }

  /**
   * validate whether the refresh token is valid or not
   * @param payload JWTRefreshPayload
   * @returns
   * @throws UnauthorizedException if the refresh token is invalid, revoked or expired
   * @throws UnauthorizedException if the user/admin is not found or is not active
   *
   * #### NOTE:
   * Passport builds a `user` object based on the return value of the `validate()` method, and attaches it as a property `('user')` on the Request object.
   */
  async validate(payload: JWTRefreshPayload): Promise<RefreshRequestUser> {
    const { sub, role, userId } = payload;
    if (role === UserRole.USER) {
      await this.userRefreshTokenService.validateRefreshToken(sub, userId);
    }
    if (role === UserRole.ADMIN) {
      await this.adminRefreshTokenService.validateRefreshToken(sub, userId);
    }
    return {
      refreshTokenId: sub,
      userId,
      role,
    };
  }
}
