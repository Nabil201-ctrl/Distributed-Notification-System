// src/decorators/public.decorator.ts
import { SetMetadata } from '@nestjs/common';

/**
 * Marks a route as public (no JWT authentication required)
 * Use for health checks, public APIs, etc.
 * 
 * @example
 * @Public()
 * @Get('health')
 * async healthCheck() { ... }
 */
export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);