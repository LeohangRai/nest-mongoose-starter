import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { UserSettings } from 'src/schemas/user-settings.schema';

export const USER_SETTINGS_PROJECTION: ProjectionFieldsOf<UserSettings> = {
  darkMode: true,
  receiveNotifications: true,
};
