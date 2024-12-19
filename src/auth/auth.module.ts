import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { AdminsModule } from 'src/admins/admins.module';
import { RefreshTokensModule } from 'src/refresh-tokens/refresh-tokens.module';
import { UsersModule } from 'src/users/users.module';
import { AdminAuthController } from './admin.auth.controller';
import { AdminAuthService } from './admin.auth.service';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { JwtStrategy } from './strategies/jwt.strategy';

@Module({
  controllers: [AdminAuthController, AuthController],
  providers: [AdminAuthService, AuthService, JwtStrategy],
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
