import { Expose } from 'class-transformer';

export class UserSettingsSerializer {
  @Expose()
  receiveNotifications?: boolean;

  @Expose()
  darkMode?: boolean;
}
