import { UserModelProjection } from 'src/schemas/user.schema';

export const USERS_LIST_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  createdAt: true,
  updatedAt: true,
};
