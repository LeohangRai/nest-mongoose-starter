import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { User } from 'src/schemas/user.schema';

export const USERS_LIST_PROJECTION: ProjectionFieldsOf<User> = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
};
