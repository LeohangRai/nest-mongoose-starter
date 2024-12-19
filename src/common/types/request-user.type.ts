import { UserRole } from '../enums/user-role.enum';

export type RequestUser = {
  id: string;
  role: UserRole;
};
