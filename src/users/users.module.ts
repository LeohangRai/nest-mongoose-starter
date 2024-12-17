import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/schemas/consts';
import { Post, PostSchema } from 'src/schemas/post.schema';
import {
  UserSettings,
  UserSettingsSchema,
} from 'src/schemas/user-settings.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.get<string>('jwt.secret'),
        signOptions: { expiresIn: configService.get<string>('jwt.expiresIn') },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: COLLECTION_NAMES.USERS,
      },
      {
        name: Post.name,
        schema: PostSchema,
        collection: COLLECTION_NAMES.POSTS,
      },
      {
        name: UserSettings.name,
        schema: UserSettingsSchema,
        collection: COLLECTION_NAMES.USER_SETTINGS,
      },
    ]),
  ],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
