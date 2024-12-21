import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-tokens.module';
import { COLLECTION_NAMES } from 'src/schemas/consts';
import { User, UserSchema } from 'src/schemas/user.schema';
import { OauthController } from './oauth.controller';
import { OauthService } from './oauth.service';
import { GithubStrategy } from './strategies/github.strategy';

@Module({
  imports: [
    MongooseModule.forFeature([
      {
        name: User.name,
        schema: UserSchema,
        collection: COLLECTION_NAMES.USERS,
      },
    ]),
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: `${configService.getOrThrow<number>('jwt.expiresIn')}s`, // using the 's' suffix to indicate seconds
        },
      }),
      inject: [ConfigService],
    }),
    RefreshTokensModule,
  ],
  providers: [OauthService, GithubStrategy],
  controllers: [OauthController],
})
export class OauthModule {}
