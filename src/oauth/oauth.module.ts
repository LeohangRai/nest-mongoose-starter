import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/schemas/consts';
import { User, UserSchema } from 'src/schemas/user.schema';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: COLLECTION_NAMES.USERS,
      },
    ]),
  ],
  providers: [OauthService],
  controllers: [OauthController],
})
export class OauthModule {}
