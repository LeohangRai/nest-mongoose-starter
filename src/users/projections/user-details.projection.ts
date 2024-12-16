import { UserModelProjection } from 'src/common/types/model.projection.types';

export const USER_DETAILS_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  settings: true,
  posts: true,
};
