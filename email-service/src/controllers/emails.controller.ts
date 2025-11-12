import { Controller, Get, NotFoundException, Param } from '@nestjs/common';
import { ApiNotFoundResponse, ApiOkResponse, ApiOperation, ApiParam, ApiTags } from '@nestjs/swagger';
import { EmailLogService } from '../services/email-log.service';
import { EmailLogResponseDto } from '../dto/email-log-response.dto';

@ApiTags('Emails')
@Controller('emails')
export class EmailsController {
  constructor(private readonly emailLogService: EmailLogService) {}

  @Get(':messageId')
  @ApiOperation({ summary: 'Retrieve email delivery details by message id' })
  @ApiParam({ name: 'messageId', description: 'Unique email message identifier' })
  @ApiOkResponse({ description: 'Email details found', type: EmailLogResponseDto })
  @ApiNotFoundResponse({ description: 'No email found for provided id' })
  getEmailByMessageId(@Param('messageId') messageId: string): EmailLogResponseDto {
    const record = this.emailLogService.get(messageId);
    if (!record) {
      throw new NotFoundException(`Email with message id "${messageId}" not found`);
    }
    return record;
  }
}
