import { ApiProperty } from '@nestjs/swagger';

export class PaginationMeta {
    @ApiProperty()
    total: number;

    @ApiProperty()
    limit: number;

    @ApiProperty()
    page: number;

    @ApiProperty()
    total_pages: number;

    @ApiProperty()
    has_next: boolean;

    @ApiProperty()
    has_previous: boolean;
}

export class ApiResponse<T> {
    @ApiProperty()
    success: boolean;

    @ApiProperty({ required: false })
    data?: T;

    @ApiProperty({ required: false })
    error?: string;

    @ApiProperty()
    message: string;

    @ApiProperty({ type: PaginationMeta, required: false })
    meta?: PaginationMeta;

    static success<T>(data: T, message = 'Success', meta?: PaginationMeta) {
        return {
            success: true,
            data,
            message,
            meta,
        };
    }

    static error(error: string, message = 'Error') {
        return {
            success: false,
            error,
            message,
        };
    }
}
