import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions, ThrottlerStorage } from '@nestjs/throttler';

export const globalThrottlerConfig: ThrottlerAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const storageEngine = configService.get<string>('rate_limit.storage');
    const storageOpts: { storage?: ThrottlerStorage } = {};
    if (storageEngine === 'redis') {
      storageOpts.storage = new ThrottlerStorageRedisService({
        host: configService.getOrThrow<string>('redis.host'),
        port: configService.getOrThrow<number>('redis.port'),
        db: configService.get<number>('redis.db'),
        username: configService.get<string>('redis.username'),
        password: configService.get<string>('redis.password'),
      });
    }
    return {
      ...storageOpts,
      throttlers: [
        {
          name: 'global', // overriding the default name 'default' with 'global' for clarity and consistency
          ttl: configService.get<number>('rate_limit.global.ttl') || 60000,
          limit: configService.get<number>('rate_limit.global.limit') || 10,
        },
      ],
    };
  },
  inject: [ConfigService],
};
