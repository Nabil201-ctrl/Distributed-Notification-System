import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsObject } from 'class-validator';

export class PushRequestDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  user_id: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  template_id: string;

  @ApiProperty()
  @IsObject()
  variables: object;
}
