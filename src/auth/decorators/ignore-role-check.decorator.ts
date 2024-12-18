import { SetMetadata } from '@nestjs/common';
import { RBACKey } from '../enums/rbac-key.enum';

export const IgnoreRoleCheck = () =>
  SetMetadata(RBACKey.IGNORE_ROLE_CHECK, true);
