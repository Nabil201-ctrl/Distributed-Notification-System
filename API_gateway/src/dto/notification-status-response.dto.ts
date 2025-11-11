import { ApiProperty } from '@nestjs/swagger';

class NotificationStatusDataDto {
  @ApiProperty()
  correlation_id: string;

  @ApiProperty({ enum: ['email', 'push'] })
  type: 'email' | 'push';

  @ApiProperty()
  user_id: string;

  @ApiProperty({ enum: ['queued', 'processing', 'sent', 'failed'] })
  status: 'queued' | 'processing' | 'sent' | 'failed';

  @ApiProperty()
  created_at: string;

  @ApiProperty()
  updated_at: string;
}

export class NotificationStatusResponseDto {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty({ type: () => NotificationStatusDataDto })
  data: NotificationStatusDataDto;
}

export class NotificationStatusNotFoundResponseDto {
  @ApiProperty({ example: false })
  success: boolean;

  @ApiProperty({ example: 'Notification not found' })
  error: string;
}
