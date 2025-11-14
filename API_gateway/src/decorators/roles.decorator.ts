import { SetMetadata } from '@nestjs/common';

/**
 * Specifies which roles are allowed to access a route
 * Can be combined with a RolesGuard for automatic role checking
 * 
 * @example
 * @Roles('admin')
 * @Get('stats')
 * async getStats() { ... }
 * 
 * @Roles('admin', 'service')
 * @Get('queues')
 * async getQueues() { ... }
 */
export const ROLES_KEY = 'roles';
export const Roles = (...roles: string[]) => SetMetadata(ROLES_KEY, roles);