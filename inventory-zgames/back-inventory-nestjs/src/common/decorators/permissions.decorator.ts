import { SetMetadata } from '@nestjs/common';

export const PERMISSIONS_KEY = 'permissions';
export const RequirePermissions = (...permissions: string[]) =>
  SetMetadata(PERMISSIONS_KEY, permissions);

export const ROLE_PERMISSIONS_KEY = 'role_permissions';
export const RolePermissions = (...permissions: string[]) =>
  SetMetadata(ROLE_PERMISSIONS_KEY, permissions);
