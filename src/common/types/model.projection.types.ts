import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { Post } from 'src/schemas/post.schema';
import { UserSettings } from 'src/schemas/user-settings.schema';
import { User } from 'src/schemas/user.schema';

type TimeStampsProjection = {
  createdAt?: boolean;
  updatedAt?: boolean;
};

export type PostModelProjection = ProjectionFieldsOf<Post> &
  TimeStampsProjection;

export type UserModelProjection = ProjectionFieldsOf<User> &
  TimeStampsProjection;

export type UserSettingsModelProjection = ProjectionFieldsOf<UserSettings> &
  TimeStampsProjection;
