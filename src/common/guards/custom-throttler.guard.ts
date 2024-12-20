import { ExecutionContext, Injectable } from '@nestjs/common';
import {
  ThrottlerException,
  ThrottlerGuard,
  ThrottlerLimitDetail,
} from '@nestjs/throttler';

@Injectable()
export class CustomThrottlerGuard extends ThrottlerGuard {
  /**
   * overrides the `@nestjs/throttler` default `ThrottlerGuard`
   * - throws a `ThrottlerException` with a detailed error message and the time left
   * until the throttling block expires.
   *
   * @param context - The execution context containing details about the request.
   * @param throttlerLimitDetail - Details about the throttler limit, including
   * time to block expiration.
   * @returns A promise that resolves to void when the exception is thrown.
   */

  protected async throwThrottlingException(
    context: ExecutionContext,
    throttlerLimitDetail: ThrottlerLimitDetail,
  ): Promise<void> {
    const { timeToBlockExpire } = throttlerLimitDetail;
    throw new ThrottlerException(
      `${await this.getErrorMessage(context, throttlerLimitDetail)}. Please wait ${timeToBlockExpire} seconds before trying again.`,
    );
  }
}
