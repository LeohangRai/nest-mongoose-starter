import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/schemas/consts';
import {
  UserSettings,
  UserSettingsSchema,
} from 'src/schemas/user-settings.schema';
import { User, UserSchema } from 'src/schemas/user.schema';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: COLLECTION_NAMES.USERS,
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
})
export class UsersModule {}
