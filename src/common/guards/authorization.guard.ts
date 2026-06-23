import {
  CanActivate,
  NotFoundException,
  ExecutionContext,
  Injectable,
} from '@nestjs/common';
import { GqlContextType } from '@nestjs/graphql';
import { Reflector } from '@nestjs/core';
import { Sys_Role } from '../enums';
@Injectable()
export class RolesGuard implements CanActivate {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly reflector: Reflector,
  ) {}
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const type = context.getType<GqlContextType>();
    switch (type) {
      case 'http': {
        const request = context.switchToHttp().getRequest();
        const userRoles = request.user?.roles;
        if (!userRoles) return false;
        const allowedRoles = this.reflector.getAllAndOverride<string[]>(
          'roles',
          [context.getHandler(), context.getClass()],
        );
        if (!allowedRoles) return true;
        const hasRole = userRoles.some((role: Sys_Role) =>
          allowedRoles.includes(role),
        );
        if (!hasRole) throw new NotFoundException('user not found');
        return hasRole;
      }
    }
    return true;
  }
}
