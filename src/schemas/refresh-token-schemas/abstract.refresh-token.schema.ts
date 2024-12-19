import { Prop } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export class RefreshToken extends Document {
  @Prop({ type: String, required: false })
  userAgent?: string;

  @Prop({ type: String, required: false })
  ipAddress?: string;

  @Prop({ type: String, required: false })
  browser?: string;

  @Prop({ type: String, required: false })
  os?: string;

  @Prop({ default: false })
  isRevoked: boolean;

  @Prop({ required: true })
  expiresAt: Date;
}
