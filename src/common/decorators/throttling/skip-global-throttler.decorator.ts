import { SkipThrottle } from '@nestjs/throttler';
import { ThrottlerName } from 'src/common/enums/throttler-name.enum';

export const SkipGlobalThrottler = () =>
  SkipThrottle({
    [ThrottlerName.GLOBAL]: true,
  });
