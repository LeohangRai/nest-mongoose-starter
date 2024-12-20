import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipGlobalThrottler } from './common/decorators/throttling/skip-global-throttler.decorator';

@ApiTags('health-check')
@Controller()
export class AppController {
  @Get()
  @SkipGlobalThrottler()
  healthCheck() {
    return {
      status: 'ok',
      message: 'App is running',
    };
  }
}
