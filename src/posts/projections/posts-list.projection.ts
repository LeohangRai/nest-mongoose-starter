import { PostModelProjection } from 'src/schemas/post.schema';

export const POSTS_LIST_PROJECTION: PostModelProjection = {
  title: true,
  content: true,
  user: true,
  createdAt: true,
  updatedAt: true,
};
