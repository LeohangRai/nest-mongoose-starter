import { UserRole } from '../enums/user-role.enum';

export type RefreshRequestUser = {
  refreshTokenId: string;
  userId: string;
  role: UserRole;
};
