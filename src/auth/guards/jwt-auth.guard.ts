import { ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Observable } from 'rxjs';
import { RBACKey } from '../enums/rbac-key.enum';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  canActivate(
    context: ExecutionContext,
  ): boolean | Promise<boolean> | Observable<boolean> {
    const isPublicApi = this.reflector.getAllAndOverride<boolean>(
      RBACKey.IS_PUBLIC_API,
      [context.getHandler(), context.getClass()],
    );
    if (isPublicApi) {
      return true;
    }
    return super.canActivate(context);
  }
}
