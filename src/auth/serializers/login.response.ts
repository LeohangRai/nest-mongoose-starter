import { Gender } from 'src/common/enums/gender.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';

export interface LoginResponse {
  access_token: string;
  data: {
    username: string;
    email: string;
    gender: Gender;
    profilePic: string;
    status: UserStatus;
  };
}
