import { SkipThrottle } from '@nestjs/throttler';
import { ThrottlerName } from 'src/common/enums/throttler-name.enum';

export const SkipAllThrottlers = () =>
  SkipThrottle({
    [ThrottlerName.GLOBAL]: true,
    [ThrottlerName.LOGIN]: true,
  });
