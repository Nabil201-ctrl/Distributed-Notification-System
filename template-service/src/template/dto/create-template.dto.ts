import { IsString, IsNotEmpty, IsObject, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTemplateDto {
  @ApiProperty({
    example: 'welcome_email',
    description: 'Human readable unique name for the template',
  })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({
    example: 'email',
    description: 'Channel type that will consume this template (email, push, etc.)',
  })
  @IsString()
  @IsNotEmpty()
  type: string;

  @ApiProperty({
    example: '<p>Hello {{name}}, welcome aboard!</p>',
    description: 'Template body that may include handlebars-style variables',
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiPropertyOptional({
    example: { name: 'Ada', product: 'Beta release' },
    description: 'Key/value pairs that describe the variables used inside the template',
    type: 'object',
    additionalProperties: { type: 'string' }
  })
  @IsObject()
  @IsOptional()
  variables?: Record<string, any>;
}
