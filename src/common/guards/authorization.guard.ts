import {
  CanActivate,
  NotFoundException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
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
    }
    return true;
  }
}
