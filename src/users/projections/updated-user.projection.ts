import { UserModelProjection } from 'src/schemas/user.schema';

export const UPDATED_USER_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  settings: true,
};
