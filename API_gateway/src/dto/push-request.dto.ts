import {
  IsString,
  IsOptional,
  IsObject,
  IsUrl,
  IsEnum,
  IsNotEmpty,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class PushRequestDto {
  @ApiProperty({
    description: 'User ID to send push notification to',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiPropertyOptional({
    description: 'Notification title',
    example: 'New Message',
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Notification body',
    example: 'You have a new message from John',
  })
  @IsOptional()
  @IsString()
  body?: string;

  @ApiPropertyOptional({
    description: 'Template ID to use',
    example: 'new_message',
  })
  @IsOptional()
  @IsString()
  template_id?: string;

  @ApiPropertyOptional({
    description: 'Variables for template',
    example: { sender: 'John', message_preview: 'Hey there!' },
  })
  @IsOptional()
  @IsObject()
  variables?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Image URL for rich notification',
    example: 'https://example.com/image.png',
  })
  @IsOptional()
  @IsUrl()
  image?: string;

  @ApiPropertyOptional({
    description: 'URL to open when notification is clicked',
    example: 'https://example.com/messages/123',
  })
  @IsOptional()
  @IsUrl()
  click_action?: string;

  @ApiPropertyOptional({
    description: 'Additional data payload',
    example: { message_id: '12345', type: 'chat' },
  })
  @IsOptional()
  @IsObject()
  data?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Priority level',
    enum: ['low', 'normal', 'high'],
    example: 'high',
  })
  @IsOptional()
  @IsEnum(['low', 'normal', 'high'])
  priority?: 'low' | 'normal' | 'high';
}