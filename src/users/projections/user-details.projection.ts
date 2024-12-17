import { UserModelProjection } from 'src/schemas/user.schema';

export const USER_DETAILS_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  settings: true,
  posts: true,
};
