import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ErrorResponseDto {
    @ApiProperty({ example: false })
    success: boolean;

    @ApiProperty({ example: 'Request failed' })
    message: string;

    @ApiProperty({ example: 'Bad Request' })
    error: string;

    @ApiProperty({ example: 400 })
    statusCode: number;

    @ApiProperty({ example: '/api/v1/users' })
    path: string;

    @ApiProperty({ example: '2025-11-12T09:11:06.010Z' })
    timestamp: string;

    @ApiPropertyOptional({
        description: 'Optional array of validation or domain errors',
        example: ['email must be an email', 'password should not be empty'],
        type: [String],
    })
    details?: string[];
}
