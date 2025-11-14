import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NotificationStatusResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    example: {
      correlation_id: 'notif_1234567890_abc123',
      status: 'sent',
      type: 'email',
      user_id: '550e8400-e29b-41d4-a716-446655440000',
      created_at: '2024-01-15T10:30:00.000Z',
      updated_at: '2024-01-15T10:30:05.000Z',
      sent_at: '2024-01-15T10:30:05.000Z',
      retry_count: 0,
    },
  })
  data: any;

  @ApiProperty({ example: 'Notification status retrieved successfully' })
  message: string;
}

export class NotificationStatusNotFoundResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Notification not found' })
  error: string;

  @ApiProperty({ example: 'No notification found with the provided correlation ID' })
  message: string;
}