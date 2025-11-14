import { createParamDecorator, ExecutionContext } from '@nestjs/common';

/**
 * Extracts the correlation ID from the request
 * Correlation ID is used for distributed tracing across services
 * 
 * Can be provided by client via 'x-correlation-id' header
 * If not provided, JwtAuthGuard generates one automatically
 * 
 * @example
 * async sendEmail(@CorrelationId() correlationId: string) {
 *   console.log('Correlation ID:', correlationId);
 *   
 * }
 */
export const CorrelationId = createParamDecorator(
    (data: unknown, ctx: ExecutionContext) => {
        const request = ctx.switchToHttp().getRequest();
        return request.correlationId || 'unknown';
    },
);