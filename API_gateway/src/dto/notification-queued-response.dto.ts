import { ApiProperty } from '@nestjs/swagger';

export class NotificationQueuedResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({
    description: 'Correlation identifier generated to track the notification across services',
  })
  correlation_id: string;

  @ApiProperty({ example: 'Email notification queued successfully' })
  message: string;
}
