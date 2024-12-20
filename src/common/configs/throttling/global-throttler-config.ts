import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions, ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerName } from 'src/common/enums/throttler-name.enum';
import { getThrottlerStorageRedisService } from 'src/common/helpers/throttling/get-throttler-storage-redis-service';

export const globalThrottlerConfig: ThrottlerAsyncOptions = {
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => {
    const storageEngine = configService.get<string>('rate_limit.storage');
    const storageOpts: { storage?: ThrottlerStorage } = {};
    if (storageEngine === 'redis') {
      storageOpts.storage = getThrottlerStorageRedisService(configService);
    }
    return {
      ...storageOpts,
      throttlers: [
        {
          name: ThrottlerName.GLOBAL, // overriding the default name 'default' with 'global' for clarity and consistency
          ttl: configService.get<number>('rate_limit.global.ttl') || 60000,
          limit: configService.get<number>('rate_limit.global.limit') || 10,
        },
      ],
    };
  },
  inject: [ConfigService],
};
