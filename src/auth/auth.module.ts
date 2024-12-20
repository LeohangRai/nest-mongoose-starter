import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ThrottlerModule } from '@nestjs/throttler';
import { AdminsModule } from 'src/admins/admins.module';
import { loginThrottlerConfig } from 'src/common/configs/throttling/login-throttler-config';
import { LoginThrottlerGuard } from 'src/common/guards/login-throttle.guard';
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
    {
      provide: APP_GUARD,
      useClass: LoginThrottlerGuard,
    },
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
    ThrottlerModule.forRootAsync(loginThrottlerConfig),
    AdminsModule,
    UsersModule,
    RefreshTokensModule,
  ],
})
export class AuthModule {}
