import { UserModelProjection } from 'src/common/types/model.projection.types';

export const USERS_LIST_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
};
