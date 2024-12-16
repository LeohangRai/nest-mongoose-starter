import { UserModelProjection } from 'src/common/types/model.projection.types';

export const UPDATED_USER_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  settings: true,
};
