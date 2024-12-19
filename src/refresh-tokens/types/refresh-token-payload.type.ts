export type UAPayload = {
  ipAddress: string;
  userAgent: string;
  browser: string;
  os: string;
};

export type RefreshTokenPayload = {
  userAgent?: string;
  ipAddress?: string;
  browser?: string;
  os?: string;
  expiresAt: Date;
  user: string;
};
