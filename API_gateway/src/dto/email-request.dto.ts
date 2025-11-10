import { ApiProperty } from '@nestjs/swagger';

export class EmailRequestDto {
  @ApiProperty()
  user_id: string;

  @ApiProperty()
  template_id: string;

  @ApiProperty()
  variables: object;
}

