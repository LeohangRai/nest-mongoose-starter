import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { JWTPayload } from 'src/common/types/jwt-payload.type';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly userService: UsersService,
    readonly configService: ConfigService,
  ) {
    super({
      /* 
        extract JWT from either:
        - cookie named 'Authentication' (for web)
        - Authorization header with Bearer token (for mobile)
      */
      jwtFromRequest: ExtractJwt.fromExtractors([
        (request: Request) => request.cookies?.Authentication,
        ExtractJwt.fromAuthHeaderAsBearerToken(),
      ]),
      ignoreExpiration: false,
      secretOrKey: configService.get<string>('jwt.secret'),
    });
  }

  async validate(payload: JWTPayload) {
    const user = await this.userService.getUserById(payload.sub);
    if (!user) {
      throw new UnauthorizedException({
        statusCode: 401,
        message: 'Invalid credential',
      });
    }
    return { userId: payload.sub, username: payload.username };
  }
}
