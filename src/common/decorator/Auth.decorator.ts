import { applyDecorators, SetMetadata, UseGuards } from '@nestjs/common';
import { AuthGuard, RolesGuard } from '../guards';
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);

export function Auth(...roles: string[]) {
  return applyDecorators(UseGuards(AuthGuard, RolesGuard), Roles(...roles));
}
