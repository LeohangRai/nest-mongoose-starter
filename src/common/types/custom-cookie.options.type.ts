import { CookieOptions } from 'express';

export type CustomCookieOptions = CookieOptions & {
  /**
   * Path for the refresh token cookie. Ideally, this should be the refresh and logout API endpoint route paths only.
   */
  refreshTokenPath: string;
};
