import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLE_PERMISSIONS_KEY } from '../decorators/permissions.decorator';

@Injectable()
export class RolePermissionsGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredPermissions = this.reflector.getAllAndOverride<string[]>(
      ROLE_PERMISSIONS_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredPermissions) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();

    if (!user || !user.role || !user.role.permissions) {
      throw new ForbiddenException('User role or permissions not found');
    }

    const userPermissions = user.role.permissions.map((perm: any) => perm.name);
    return requiredPermissions.every((perm) => userPermissions.includes(perm));
  }
}
