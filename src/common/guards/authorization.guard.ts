import {
  CanActivate,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlContextType, GqlExecutionContext } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { IUser } from '../interfaces';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private readonly reflector: Reflector) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType<GqlContextType>();
    switch (type) {
      case 'http': {
        const request = context.switchToHttp().getRequest();
        const userRole = request.user?.role;
        if (!userRole) return false;
        const allowedRoles = this.reflector.getAllAndOverride<string[]>(
          'roles',
          [context.getHandler(), context.getClass()],
        );
        if (!allowedRoles) return true;
        if (allowedRoles && allowedRoles.includes(userRole)) return true;
        return false;
      }
      case 'graphql': {
        const gqlContext = GqlExecutionContext.create(context);
        const { req } = gqlContext.getContext<{
          req: Request & { user: IUser };
        }>();
        const userRole = req.user?.role;
        if (!userRole) return false;
        const allowedRoles = this.reflector.getAllAndOverride<string[]>(
          'roles',
          [context.getHandler(), context.getClass()],
        );
        if (!allowedRoles) return true;
        if (allowedRoles && allowedRoles.includes(userRole)) return true;
        return false;
      }
    }
    return true;
  }
}
