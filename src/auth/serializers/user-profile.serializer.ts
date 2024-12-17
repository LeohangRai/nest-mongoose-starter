import { Expose, Type } from 'class-transformer';
import { Gender } from 'src/common/enums/gender.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { UserSettingsSerializer } from 'src/users/serializers/user-settings.serializer';

export class UserProfileSerializer {
  @Expose()
  _id: string;

  @Expose()
  username: string;

  @Expose()
  email: string;

  @Expose()
  gender: Gender;

  @Expose()
  profilePic: string;

  @Expose()
  status: UserStatus;

  @Expose()
  createdAt: Date;

  @Expose()
  @Type(() => UserSettingsSerializer)
  settings: UserSettingsSerializer;
}
