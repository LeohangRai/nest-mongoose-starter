import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { MongooseModule } from '@nestjs/mongoose';
import { COLLECTION_NAMES } from 'src/schemas/consts';
import {
  AdminRefreshToken,
  AdminRefreshTokenSchema,
} from 'src/schemas/refresh-token-schemas/admin.refresh-token.schema';
import {
  UserRefreshToken,
  UserRefreshTokenSchema,
} from 'src/schemas/refresh-token-schemas/user.refresh-token.schema';
import { AdminRefreshTokensService } from './services/admin.refresh-tokens.service';
import { UserRefreshTokensService } from './services/user.refresh-tokens.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.refreshTokenSecret'),
        signOptions: {
          expiresIn: `${configService.getOrThrow<number>('jwt.refreshTokenExpiresIn')}s`, // using the 's' suffix to indicate seconds
        },
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      {
        name: UserRefreshToken.name,
        schema: UserRefreshTokenSchema,
        collection: COLLECTION_NAMES.USER_REFRESH_TOKENS,
      },
      {
        name: AdminRefreshToken.name,
        schema: AdminRefreshTokenSchema,
        collection: COLLECTION_NAMES.ADMIN_REFRESH_TOKENS,
      },
    ]),
  ],
  providers: [AdminRefreshTokensService, UserRefreshTokensService],
  exports: [AdminRefreshTokensService, UserRefreshTokensService],
})
export class RefreshTokensModule {}
