import { SetMetadata } from '@nestjs/common';

export const ROLES_KEY = 'roles';

/** Decorator để đánh dấu route chỉ dành cho role nhất định */
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);
