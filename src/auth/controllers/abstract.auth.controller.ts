import { Request, Response } from 'express';
import { RefreshRequestUser } from 'src/common/types/refresh-request-user.type';
import { RequestUser } from 'src/common/types/request-user.type';
import { UAPayload } from 'src/refresh-tokens/types/refresh-token-payload.type';
import { UAParser } from 'ua-parser-js';
import { LoginDto } from '../dtos/login.dto';
import { AdminProfileSerializer } from '../serializers/admin-profile.serializer';
import { UserProfileSerializer } from '../serializers/user-profile.serializer';
import {
  MobileLoginResponse,
  MobileRefreshResponse,
  WebLoginResponse,
} from '../types/login.response.type';

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

  /**
   * handle web login process.
   * @param loginData - The login credentials provided by the user.
   * @param req - The Express request object containing the user's request details.
   * @param res - The Express response object to be used for sending the response.
   * @returns A promise that resolves to a WebLoginResponse, containing login result data.
   */
  abstract webLogin(
    loginData: LoginDto,
    req: Request,
    res: Response,
  ): Promise<WebLoginResponse>;

  /**
   * handle mobile login process.
   * @param loginData - The login credentials provided by the user.
   * @param req - The Express request object containing the user's request details.
   * @returns A promise that resolves to a MobileLoginResponse, containing login result data.
   */
  abstract mobileLogin(
    loginData: LoginDto,
    req: Request,
  ): Promise<MobileLoginResponse>;

  /**
   * handle web refresh process.
   * @param user - The user data contained in the JWT refresh token.
   * @param req - The Express request object containing the user's request details.
   * @param res - The Express response object to be used for sending the response.
   * @returns A promise that resolves to void, or void itself.
   */
  abstract refreshWeb(
    user: RefreshRequestUser,
    req: Request,
    res: Response,
  ): Promise<void> | void;

  /**
   * handle mobile refresh process.
   * @param user - The user data contained in the JWT refresh token.
   * @param req - The Express request object containing the user's request details.
   * @returns A promise that resolves to a MobileRefreshResponse, containing new access token & refresh token.
   */
  abstract refreshMobile(
    user: RefreshRequestUser,
    req: Request,
  ): Promise<MobileRefreshResponse>;

  /**
   * get the profile of a user.
   * @param user - The user data contained in the JWT access token.
   * @returns A promise that resolves to a AdminProfileSerializer or UserProfileSerializer, depending on the user's role.
   */
  abstract getProfile(
    user: RequestUser,
  ): Promise<AdminProfileSerializer | UserProfileSerializer>;
}
