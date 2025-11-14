import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the current authenticated user from the request
 * User info is attached by JwtAuthGuard after JWT verification
 * 
 * @example
 * 
 * async sendEmail(@CurrentUser() user: any) {
 *   console.log(user.id, user.email, user.role);
 * }
 * 
 * 
 * async sendEmail(@CurrentUser('id') userId: string) {
 *   console.log(userId);
 * }
 */
export const CurrentUser = createParamDecorator(
    (data: string | undefined, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        const user = request.user;

        return data ? user?.[data] : user;
    },
);