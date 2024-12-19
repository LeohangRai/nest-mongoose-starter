import { Gender } from 'src/common/enums/gender.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';

export type WebLoginResponse = {
  data: {
    username: string;
    email: string;
    gender: Gender;
    profilePic: string;
    status: UserStatus;
  };
};

export type MobileRefreshResponse = {
  refreshToken: string;
  accessToken: string;
};

export type MobileLoginResponse = WebLoginResponse & MobileRefreshResponse;
