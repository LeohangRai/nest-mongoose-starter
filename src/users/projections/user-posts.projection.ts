import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { Post } from 'src/schemas/post.schema';

export const USER_POSTS_PROJECTION: ProjectionFieldsOf<Post> = {
  title: true,
};
