import {
    ArgumentsHost,
    Catch,
    ExceptionFilter,
    HttpException,
    HttpStatus,
    Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { ApiResponse } from '../dto/api-response.dto';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
    private readonly logger = new Logger(HttpExceptionFilter.name);

    catch(exception: unknown, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response = ctx.getResponse<Response>();
        const request = ctx.getRequest<Request>();

        let status = HttpStatus.INTERNAL_SERVER_ERROR;
        let message: string | string[] = 'Internal server error';
        let errorTitle = 'Internal Server Error';

        if (exception instanceof HttpException) {
            status = exception.getStatus();
            const exceptionResponse = exception.getResponse();
            if (typeof exceptionResponse === 'string') {
                message = exceptionResponse;
            } else if (exceptionResponse && typeof exceptionResponse === 'object') {
                const res = exceptionResponse as Record<string, any>;
                message = res.message ?? message;
                errorTitle = res.error ?? errorTitle;
            }
        } else if (exception instanceof Error) {
            message = exception.message;
            errorTitle = exception.name;
            this.logger.error(exception.stack ?? exception.message);
        } else {
            this.logger.error(exception);
        }

        const errorMessage = Array.isArray(message) ? message.join(', ') : message;
        const base = ApiResponse.error(errorMessage, 'Request failed');

        response.status(status).json({
            ...base,
            statusCode: status,
            error: errorTitle,
            path: request.url,
            timestamp: new Date().toISOString(),
            details: Array.isArray(message) ? message : undefined,
        });
    }
}
