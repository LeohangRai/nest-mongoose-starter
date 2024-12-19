import { CustomCookieOptions } from 'src/common/types/custom-cookie.options.type';

export const DEFAULT_COOKIE_OPTIONS: CustomCookieOptions = {
  httpOnly: true,
  secure: false,
  /* 
    for access token cookie
    '/' is the default path value (the cookie will be available to all routes) 
  */
  path: '/',
  /*
    for refresh token cookie
    make sure to override this in the auth service classes with the correspoding refresh API endpoint route path
    Example: '/auth' for the user auth service and '/auth/admin' for the admin auth service
  */
  refreshTokenPath: '/auth',
};
