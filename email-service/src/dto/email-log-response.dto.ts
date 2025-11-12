import { ApiProperty } from '@nestjs/swagger';

export class EmailLogResponseDto {
  @ApiProperty({ example: 'email_1731378000000_c5cf0505' })
  messageId: string;

  @ApiProperty({ example: 'user-uuid' })
  userId: string;

  @ApiProperty({ example: 'template-uuid' })
  templateId: string;

  @ApiProperty({ example: 'recipient@example.com' })
  to: string;

  @ApiProperty({ example: 'Welcome aboard' })
  subject: string;

  @ApiProperty({
    example: { name: 'Njay', product: 'Alpha' },
    type: 'object',
    additionalProperties: { type: 'string' },
  })
  variables: Record<string, any>;

  @ApiProperty({ example: '2025-11-12T10:24:49.123Z' })
  sentAt: string;
}
