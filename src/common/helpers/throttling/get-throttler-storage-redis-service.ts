import { ThrottlerStorageRedisService } from '@nest-lab/throttler-storage-redis';
import { ConfigService } from '@nestjs/config';

/**
 * Returns a new instance of `ThrottlerStorageRedisService`, which is a
 * Redis-based storage for Nest's throttler. The configuration options
 * are loaded from the provided `ConfigService` instance.
 *
 * @param configService - The application's configuration service.
 * @returns A new instance of `ThrottlerStorageRedisService`.
 */
export const getThrottlerStorageRedisService = (
  configService: ConfigService,
): ThrottlerStorageRedisService => {
  return new ThrottlerStorageRedisService({
    host: configService.getOrThrow<string>('redis.host'),
    port: configService.getOrThrow<number>('redis.port'),
    db: configService.get<number>('redis.db'),
    username: configService.get<string>('redis.username'),
    password: configService.get<string>('redis.password'),
  });
};
