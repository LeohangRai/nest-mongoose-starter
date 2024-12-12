import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

@Schema()
export class UserSettings {
  @Prop({ required: false, default: true })
  receiveNotifications?: boolean;

  @Prop({ required: false, default: true })
  darkMode?: boolean;
}

export const UserSettingsSchema = SchemaFactory.createForClass(UserSettings);
