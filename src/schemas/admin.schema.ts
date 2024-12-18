import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Gender } from 'src/common/enums/gender.enum';
import { AdminStatus } from 'src/common/enums/user-status.enum';
import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';

@Schema({ timestamps: true })
export class Admin {
  @Prop({
    unique: true,
    required: true,
    trim: true,
  })
  username: string;

  @Prop({
    required: true,
    trim: true,
    lowercase: true,
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

  @Prop({
    required: true,
  })
  password: string;

  @Prop({
    enum: AdminStatus,
    default: AdminStatus.ACTIVE,
  })
  status: AdminStatus;
}

export const AdminSchema = SchemaFactory.createForClass(Admin);

export type AdminWithTimestamps = Admin & {
  _id: string | mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type AdminModelFields = keyof AdminWithTimestamps;

export type AdminModelProjection = ProjectionFieldsOf<AdminWithTimestamps>;
