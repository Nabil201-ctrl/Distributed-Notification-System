import { ApiProperty } from '@nestjs/swagger';

export class NotificationQueuedResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ example: 'notif_1234567890_abc123' })
  correlation_id: string;

  @ApiProperty({ example: 'Email notification queued successfully' })
  message: string;

  @ApiProperty({ example: '2024-01-15T10:30:00.000Z' })
  queued_at: string;
}