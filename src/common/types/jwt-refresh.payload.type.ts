import { UserRole } from '../enums/user-role.enum';

export type JWTRefreshPayload = {
  sub: string; // ID of the refresh token document in the database collection
  userId: string; // ID of the user/admin
  role: UserRole;
  iat: number;
  exp: number;
};
