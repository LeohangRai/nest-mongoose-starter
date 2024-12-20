import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { SkipThrottle } from '@nestjs/throttler';

@ApiTags('health-check')
@Controller()
export class AppController {
  @Get()
  @SkipThrottle({ global: true })
  healthCheck() {
    return {
      status: 'ok',
      message: 'App is running',
    };
  }
}
