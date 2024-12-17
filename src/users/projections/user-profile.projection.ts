import { UserModelProjection } from 'src/schemas/user.schema';

export const USER_PROFILE_PROJECTION: UserModelProjection = {
  _id: true,
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  status: true,
  createdAt: true,
  settings: true,
};
