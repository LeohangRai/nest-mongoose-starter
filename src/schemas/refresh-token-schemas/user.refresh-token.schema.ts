import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { User } from '../user.schema';
import { RefreshToken } from './abstract.refresh-token.schema';

@Schema({ timestamps: true })
export class UserRefreshToken extends RefreshToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'User', required: true })
  user: User;
}

export const UserRefreshTokenSchema =
  SchemaFactory.createForClass(UserRefreshToken);
