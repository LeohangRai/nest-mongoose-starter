import { UserRole } from '../enums/user-role.enum';

export type JWTPayload = {
  username: string;
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
};
