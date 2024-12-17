import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { TimeStampsProjection } from 'src/common/types/common-projection.type';
import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';

@Schema({ timestamps: true })
export class UserSettings {
  @Prop({ required: false, default: true })
  receiveNotifications?: boolean;

  @Prop({ required: false, default: true })
  darkMode?: boolean;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);

export type UserSettingsModelProjection = ProjectionFieldsOf<UserSettings> &
  TimeStampsProjection;
