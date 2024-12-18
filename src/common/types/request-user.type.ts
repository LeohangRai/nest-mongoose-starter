import { UserRole } from '../enums/user-role.enum';

export type RequestUser = {
  userId: string;
  username: string;
  role: UserRole;
};
