export type JWTPayload = {
  username: string;
  sub: string;
  iat: number;
  exp: number;
};
