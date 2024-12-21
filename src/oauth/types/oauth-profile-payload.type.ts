import { AuthProvider } from 'src/common/enums/auth-provider.enum';

export type OauthProfilePayload = {
  provider: AuthProvider;
  providerId: string;
  displayName?: string;
  profilePic?: string;
  email?: string;
  isEmailVerified?: boolean;
};
