import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminsModule } from 'src/admins/admins.module';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-tokens.module';
import { UsersModule } from 'src/users/users.module';
import { AdminAuthController } from './controllers/admin.auth.controller';
import { UserAuthController } from './controllers/user.auth.controller';
import { AdminAuthService } from './services/admin.auth.service';
import { UserAuthService } from './services/user.auth.service';
import { JwtRefreshStrategy } from './strategies/jwt-refresh.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AdminAuthController, UserAuthController],
  providers: [
    AdminAuthService,
    UserAuthService,
    JwtStrategy,
    JwtRefreshStrategy,
  ],
  imports: [
    JwtModule.registerAsync({
      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('jwt.secret'),
        signOptions: {
          expiresIn: `${configService.getOrThrow<number>('jwt.expiresIn')}s`, // using the 's' suffix to indicate seconds
        },
      }),
      inject: [ConfigService],
    }),
    AdminsModule,
    UsersModule,
    RefreshTokensModule,
  ],
})
export class AuthModule {}
