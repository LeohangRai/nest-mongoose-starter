import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from 'src/common/enums/user-role.enum';
import { RequestUser } from 'src/common/types/request-user.type';
import { RBACKey } from '../enums/rbac-key.enum';

@Injectable()
export class RBACGuard implements CanActivate {
  /**
   * this array (tuple) will hold the context's route handler method and controller class instances
   * [routeHandler, controllerClass]
   */
  private contextHandlerAndClass: any[] = [];

  constructor(private reflector: Reflector) {}

  /**
   * The 'role' value is set on the JWT token during login request based on which login endpoint was called. ('/auth/admin/login' or '/auth/login')
   * - You can see this inside of the respective route handlers of the login endpoints.
   * @param user
   */
  private validateUserRole(user: RequestUser) {
    const allowedRoles = this.reflector.getAllAndOverride<UserRole[]>(
      RBACKey.ALLOWED_ROLES,
      this.contextHandlerAndClass,
    );
    if (allowedRoles?.length && !allowedRoles.includes(user.role)) {
      throw new ForbiddenException({
        statusCode: 403,
        message:
          'You are not authorized to access this resource. Please contact support',
        error: 'Forbidden',
      });
    }
  }

  canActivate(context: ExecutionContext) {
    /* 
      Since the reflector.getAllAndOverride() returns the left-most not null value, 
      we're going to first check for the roles metadata from the route handler (context.getHandler()) and then the controller (context.getClass())
      
      NOTE: If you want to prioritize controller level decorator metadata over route handler level, change the order to [context.getClass(), context.getHandler()]
    */
    this.contextHandlerAndClass = [context.getHandler(), context.getClass()];

    /* skip the role check if the route handler method or controller class has been marked as public */
    const isPublicApi = this.reflector.getAllAndOverride<boolean>(
      RBACKey.IS_PUBLIC_API,
      this.contextHandlerAndClass,
    );
    if (isPublicApi) return true;

    const { user }: { user: RequestUser } = context.switchToHttp().getRequest();
    if (!user) return false;

    /* skip the role check if the route handler method or controller class has been marked to ignore role check */
    const ignoreRoleCheck = this.reflector.getAllAndOverride<boolean>(
      RBACKey.IGNORE_ROLE_CHECK,
      this.contextHandlerAndClass,
    );
    if (ignoreRoleCheck) return true;

    this.validateUserRole(user);
    return true;
  }
}
