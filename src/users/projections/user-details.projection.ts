import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { User } from 'src/schemas/user.schema';

export const USER_DETAILS_PROJECTION: ProjectionFieldsOf<User> = {
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  settings: true,
  posts: true,
};
