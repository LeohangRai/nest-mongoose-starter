import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Schema as MongooseSchema } from 'mongoose';
import { Admin } from '../admin.schema';
import { RefreshToken } from './abstract.refresh-token.schema';

@Schema({ timestamps: true })
export class AdminRefreshToken extends RefreshToken {
  @Prop({ type: MongooseSchema.Types.ObjectId, ref: 'Admin', required: true })
  admin: Admin;
}

export const AdminRefreshTokenSchema =
  SchemaFactory.createForClass(AdminRefreshToken);
