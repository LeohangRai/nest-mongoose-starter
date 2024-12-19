export type UAPayload = {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
};

export type BaseRefreshTokenPayload = {
  userAgent?: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  expiresAt: Date;
};

export type UserRefreshTokenPayload = BaseRefreshTokenPayload & {
  user: string;
};

export type AdminRefreshTokenPayload = BaseRefreshTokenPayload & {
  admin: string;
};
