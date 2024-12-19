import { UserRole } from '../enums/user-role.enum';

export type SignJWTInput = {
  /**
   * ID of the user/admin
   */
  sub: string;
  /**
   * Role of the user (USER/ADMIN)
   */
  role: UserRole;
};

export type SignRefreshJWTInput = {
  /**
   * ID of the refresh token document in the database collection
   */
  sub: string;
  /**
   * ID of the user/admin
   */
  userId: string;
  /**
   * Role of the user (USER/ADMIN)
   */
  role: UserRole;
};
