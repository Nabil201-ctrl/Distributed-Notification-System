import { ApiProperty } from '@nestjs/swagger';

export class ErrorResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Validation failed' })
  error: string;

  @ApiProperty({ example: 'Failed to queue notification' })
  message: string;
}