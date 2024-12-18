import { SetMetadata } from '@nestjs/common';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RBACKey } from '../enums/rbac-key.enum';

export const AllowRoles = (...roles: UserRole[]) =>
  SetMetadata(RBACKey.ALLOWED_ROLES, roles);
