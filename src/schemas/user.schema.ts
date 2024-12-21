import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import mongoose from 'mongoose';
import { AuthProvider } from 'src/common/enums/auth-provider.enum';
import { Gender } from 'src/common/enums/gender.enum';
import { UserStatus } from 'src/common/enums/user-status.enum';
import { ProjectionFieldsOf } from 'src/common/types/projection-fields-of';
import { Post } from './post.schema';
import { UserSettings } from './user-settings.schema';

function isRegisteredWithLocalAuthProvider(): boolean {
  return this.originalProvider === AuthProvider.LOCAL;
}

export class UserLinkedAccount {
  provider: AuthProvider;
  providerId: string;
}

@Schema({ timestamps: true })
export class User {
  @Prop({
    enum: AuthProvider,
    required: true,
  })
  // the provider that was used to authenticate the user for the first time
  originalProvider: AuthProvider;

  @Prop({
    unique: true,
    trim: true,
    required: isRegisteredWithLocalAuthProvider,
  })
  username?: string;

  @Prop({
    trim: true,
    required: isRegisteredWithLocalAuthProvider,
  })
  displayName?: string;

  @Prop({
    trim: true,
    lowercase: true,
    required: isRegisteredWithLocalAuthProvider,
  })
  email?: string;

  @Prop({
    required: false,
  })
  profilePic?: string;

  @Prop({
    enum: Gender,
  })
  gender?: Gender;

  @Prop({
    required: isRegisteredWithLocalAuthProvider,
  })
  password?: string;

  @Prop({
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  status?: UserStatus;

  @Prop({
    type: [{ type: UserLinkedAccount }],
  })
  // an array of linked oauth accounts that the user has linked and can use to authenticate
  linkedAccounts?: UserLinkedAccount[];

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
  posts?: Post[];
}

export const UserSchema = SchemaFactory.createForClass(User);

export type UserWithTimestamps = User & {
  _id: string | mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
};

export type UserModelFields = keyof UserWithTimestamps;

export type UserModelProjection = ProjectionFieldsOf<UserWithTimestamps>;
