import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Gender } from 'src/common/enums/gender.enum';
import { UserSettings } from './user-settings.schema';

@Schema()
export class User {
  @Prop({
    unique: true,
    required: true,
  })
  username: string;

  @Prop({
    required: true,
  })
  email: string;

  @Prop({
    required: false,
  })
  profilePic?: string;

  @Prop({
    enum: Gender,
  })
  gender?: Gender;

  /* NOTE: This field will actually be populated with an ObjectID value which we can populate with an associated 'UserSettings' instance */
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSettings',
  })
  settings?: UserSettings;
}

export const UserSchema = SchemaFactory.createForClass(User);
