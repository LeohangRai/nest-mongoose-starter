import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { Gender } from 'src/common/enums/gender.enum';
import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { Post } from './post.schema';
import { UserSettings } from './user-settings.schema';

@Schema({ timestamps: true })
export class User {
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

  /* NOTE: This field will actually hold an ObjectID value which we can populate with the associated 'UserSettings' document using the 'populate()' method */
  @Prop({
    type: mongoose.Schema.Types.ObjectId,
    ref: 'UserSettings',
  })
  settings?: UserSettings;

  /* NOTE: This field will actually hold an array of ObjectIDs, which we can populate with the associated 'Post' documents using the 'populate()' method */
  @Prop({
    type: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Post' }],
  })
  posts: Post[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserWithTimestamps = User & {
  createdAt: Date;
  updatedAt: Date;
};

export type UserModelSortFields = keyof UserWithTimestamps;

export type UserModelProjection = ProjectionFieldsOf<UserWithTimestamps>;
