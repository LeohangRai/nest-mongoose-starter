import { Request, Response } from 'express';
import { RequestUser } from 'src/common/types/request-user.type';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import { UAParser } from 'ua-parser-js';
import { LoginDto } from './dtos/login.dto';
import { AdminProfileSerializer } from './serializers/admin-profile.serializer';
import { UserProfileSerializer } from './serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  WebLoginResponse,
} from './types/login.response.type';

export abstract class AbstractAuthController {
  protected getUaPayload(req: Request): UAPayload {
    const ua = UAParser(req.headers['user-agent']);
    return {
      ipAddress: req.ip,
      userAgent: ua.ua,
      browser: ua.browser.name,
      os: ua.os.name,
    };
  }

  abstract webLogin(
    loginData: LoginDto,
    req: Request,
    res: Response,
  ): Promise<WebLoginResponse>;

  abstract mobileLogin(
    loginData: LoginDto,
    req: Request,
  ): Promise<MobileLoginResponse>;

  abstract getProfile(
    user: RequestUser,
  ): Promise<AdminProfileSerializer | UserProfileSerializer>;
}
