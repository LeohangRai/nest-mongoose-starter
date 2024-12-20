import { ExecutionContext, Injectable } from '@nestjs/common';
import { CustomThrottlerGuard } from './custom-throttler.guard';

@Injectable()
export class LoginThrottlerGuard extends CustomThrottlerGuard {
  protected getTracker(req: Record<string, any>): Promise<string> {
    const username = req.body.username;
    const ip = req.ip;
    /* I don't know why they did not set 'Promise<string> | string' as the return type */
    return Promise.resolve(`login-throttle-${username}-${ip}`);
  }

  protected shouldSkip(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const isLoginRequest =
      request.path?.includes('login') && request.method === 'POST';
    return Promise.resolve(!isLoginRequest);
  }
}
