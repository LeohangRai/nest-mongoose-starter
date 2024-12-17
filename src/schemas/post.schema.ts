import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { User } from './user.schema';

@Schema({ timestamps: true })
export class Post {
  @Prop({ required: true, trim: true })
  title: string;

  @Prop({ required: false, trim: true })
  content: string;

  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  })
  user: User;
}

export const PostSchema = SchemaFactory.createForClass(Post);

export type PostWithTimestamps = Post & {
  createdAt: Date;
  updatedAt: Date;
};

export type PostModelSortFields = keyof PostWithTimestamps;

export type PostModelProjection = ProjectionFieldsOf<PostWithTimestamps>;
