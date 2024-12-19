import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AdminsService } from 'src/admins/admins.service';
import { UserRole } from 'src/common/enums/user-role.enum';
import { JWTPayload } from 'src/common/types/jwt-payload.type';
import { RequestUser } from 'src/common/types/request-user.type';
import { UsersService } from 'src/users/users.service';
import { CookieKey } from '../enums/cookie-key.enum';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    readonly configService: ConfigService,
    private readonly userService: UsersService,
    private readonly adminService: AdminsService,
  ) {
    super({
      /* 
        extract JWT from either:
        - cookie named 'AccessToken' (for web)
        - Authorization header with Bearer token (for mobile)
      */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.[CookieKey.AccessToken],
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  /**
   * validate whether the `id` from the JWT payload is valid or not
   * - useful for cases where the user is deleted/blocked after the token is issued
   *
   * #### NOTE:
   * Passport builds a `user` object based on the return value of the `validate()` method, and attaches it as a property `('user')` on the Request object.
   * @param payload
   * @returns RequestUser
   * @throws UnauthorizedException if the user is not found or is not active
   */
  async validate(payload: JWTPayload): Promise<RequestUser> {
    if (payload.role === UserRole.USER) {
      await this.userService.validateUserId(payload.sub);
    }
    if (payload.role === UserRole.ADMIN) {
      await this.adminService.validateAdminId(payload.sub);
    }
    return {
      id: payload.sub,
      role: payload.role,
    };
  }
}
