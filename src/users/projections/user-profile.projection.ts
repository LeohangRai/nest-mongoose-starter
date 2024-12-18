import { ADMIN_PROFILE_PROJECTION } from 'src/admins/projections/admin-profile.projection';
import { UserModelProjection } from 'src/schemas/user.schema';

export const USER_PROFILE_PROJECTION: UserModelProjection = {
  ...ADMIN_PROFILE_PROJECTION,
  settings: true,
};
