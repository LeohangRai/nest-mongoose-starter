import { ConfigModule, ConfigService } from '@nestjs/config';
import { ThrottlerAsyncOptions, ThrottlerStorage } from '@nestjs/throttler';
import { ThrottlerName } from 'src/common/enums/throttler-name.enum';
import { getThrottlerStorageRedisService } from 'src/common/helpers/throttling/get-throttler-storage-redis-service';

export const loginThrottlerConfig: ThrottlerAsyncOptions = {
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
          name: ThrottlerName.LOGIN,
          ttl: configService.get<number>('rate_limit.login.ttl') || 300000,
          limit: configService.get<number>('rate_limit.login.limit') || 5,
        },
      ],
    };
  },
  inject: [ConfigService],
};
