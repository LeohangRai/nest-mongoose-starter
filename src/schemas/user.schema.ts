import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Gender } from 'src/common/enums/gender.enum';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
