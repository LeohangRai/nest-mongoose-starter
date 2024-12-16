import { PostModelProjection } from 'src/common/types/model.projection.types';

export const POSTS_LIST_PROJECTION: PostModelProjection = {
  title: true,
  content: true,
  user: true,
  createdAt: true,
  updatedAt: true,
};
