import { SetMetadata } from '@nestjs/common';
import { RBACKey } from '../enums/rbac-key.enum';

export const PublicAPI = () => SetMetadata(RBACKey.IS_PUBLIC_API, true);
