import { SetMetadata } from '@nestjs/common';
import { UserRole } from '@prisma/client';

export const ROLES_KEY = 'roles';

/**
 * Roles decorator - restricts access to specified roles
 * @param roles - Array of allowed roles (e.g., 'ADMIN', 'INSTRUCTOR')
 * @example @Roles('ADMIN')
 * @example @Roles('ADMIN', 'INSTRUCTOR')
 */
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
