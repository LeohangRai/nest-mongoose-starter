import { UserModelProjection } from 'src/common/types/model.projection.types';

export const POST_USER_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
};
