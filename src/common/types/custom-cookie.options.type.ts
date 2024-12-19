import { CookieOptions } from 'express';

export type CustomCookieOptions = CookieOptions & {
  /**
   * Path for the refresh token cookie.
   */
  refreshTokenPath: string;
};
