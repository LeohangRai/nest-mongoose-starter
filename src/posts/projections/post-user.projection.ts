import { UserModelProjection } from 'src/schemas/user.schema';

export const POST_USER_PROJECTION: UserModelProjection = {
  username: true,
  email: true,
  gender: true,
};
