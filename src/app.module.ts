import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { MongooseModule } from '@nestjs/mongoose';
import { ThrottlerModule } from '@nestjs/throttler';
import { readFileSync } from 'fs';
import { load as yamlLoad } from 'js-yaml';
import { AdminsModule } from './admins/admins.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { globalThrottlerConfig } from './common/configs/throttling/global-throttler-config';
import { CustomThrottlerGuard } from './common/guards/custom-throttler.guard';
import { PostsModule } from './posts/posts.module';
import { RefreshTokensModule } from './refresh-tokens/refresh-tokens.module';
import { UsersModule } from './users/users.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [() => yamlLoad(readFileSync('config/default.yml', 'utf-8'))],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.getOrThrow<string>('database.mongo_url'),
      }),
      inject: [ConfigService],
    }),
    ThrottlerModule.forRootAsync(globalThrottlerConfig),
    AuthModule,
    RefreshTokensModule,
    UsersModule,
    PostsModule,
    AdminsModule,
  ],
  controllers: [AppController],
  providers: [
    {
      provide: APP_GUARD,
      useClass: CustomThrottlerGuard,
    },
  ],
})
export class AppModule {}
