import { AdminModelProjection } from 'src/schemas/admin.schema';

export const ADMIN_PROFILE_PROJECTION: AdminModelProjection = {
  _id: true,
  username: true,
  email: true,
  gender: true,
  profilePic: true,
  status: true,
  createdAt: true,
};
