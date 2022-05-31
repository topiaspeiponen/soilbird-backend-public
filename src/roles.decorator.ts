import { SetMetadata } from '@nestjs/common';

/** Minimum access level required to access an endpoint
 * 
 */
export const Roles = (...roles: string[]) => SetMetadata('roles', roles);
