import { SetMetadata } from '@nestjs/common';
import { Role } from '@prisma/client';
export const ROLES_KEY = 'roles';
// e.g. @Roles(Role.ADMIN) on admin-only endpoints
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
