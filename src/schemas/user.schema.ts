import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

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
}

export const UserSchema = SchemaFactory.createForClass(User);
