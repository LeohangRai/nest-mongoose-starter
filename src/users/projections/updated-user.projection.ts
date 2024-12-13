import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { User } from 'src/schemas/user.schema';

export const UPDATED_USER_PROJECTION: ProjectionFieldsOf<User> = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  settings: true,
};
