import {
    Injectable,
    CanActivate,
    ExecutionContext,
    UnauthorizedException,
    Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';

export const IS_PUBLIC_KEY = 'isPublic';

interface JwtPayload {
    sub: string; // user id
    email: string;
    role: string;
    type: 'access' | 'refresh';
    iat: number;
    exp: number;
}

@Injectable()
export class JwtAuthGuard implements CanActivate {
    private readonly logger = new Logger(JwtAuthGuard.name);
    private readonly jwtSecret: string;

    constructor(
        private configService: ConfigService,
        private reflector: Reflector,
    ) {
        this.jwtSecret = this.configService.get<string>('JWT_SECRET', '');
        console.log(this.jwtSecret)
        if (!this.jwtSecret) {
            throw new Error('JWT_SECRET not configured');
        }
    }

    canActivate(context: ExecutionContext): boolean {
        // Check if route is marked as public
        const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
            context.getHandler(),
            context.getClass(),
        ]);

        if (isPublic) {
            return true;
        }

        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('No token provided');
        }

        try {
            const payload = jwt.verify(token, this.jwtSecret) as JwtPayload;

            // Verify it's an access token (not refresh)
            if (payload.type !== 'access') {
                throw new UnauthorizedException('Invalid token type');
            }

            // Attach user info to request
            request.user = {
                id: payload.sub,
                email: payload.email,
                role: payload.role,
            };

            // Add correlation ID for tracing
            if (!request.headers['x-correlation-id']) {
                request.correlationId = this.generateCorrelationId();
            } else {
                request.correlationId = request.headers['x-correlation-id'];
            }

            return true;
        } catch (error) {
            if (error.name === 'TokenExpiredError') {
                throw new UnauthorizedException('Token expired');
            }
            if (error.name === 'JsonWebTokenError') {
                throw new UnauthorizedException('Invalid token');
            }
            throw new UnauthorizedException('Authentication failed');
        }
    }

    private extractTokenFromHeader(request: any): string | null {
        const authHeader = request.headers.authorization;
        if (!authHeader) {
            return null;
        }

        const [type, token] = authHeader.split(' ');
        return type === 'Bearer' ? token : null;
    }

    private generateCorrelationId(): string {
        return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
}