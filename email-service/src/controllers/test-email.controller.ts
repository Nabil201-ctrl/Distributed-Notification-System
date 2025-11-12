import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { ApiBody, ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { EmailProcessorService } from '../services/email-processor.service';
import { TestEmailDto } from '../dto/test-email.dto';

@ApiTags('Test')
@Controller('test')
export class TestEmailController {
  constructor(private readonly emailProcessor: EmailProcessorService) {}

  @Post('send')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Trigger an email send without queue (testing only)' })
  @ApiBody({ type: TestEmailDto })
  @ApiOkResponse({
    description: 'Email processed successfully',
    schema: {
      example: {
        success: true,
        message: 'Email processed',
        data: {
          messageId: 'email_1731378000000_c5cf0505',
        },
      },
    },
  })
  async testSend(@Body() payload: TestEmailDto) {
    const messageId = await this.emailProcessor.processPayload({
      ...payload,
      type: 'email',
    });
    return { success: true, message: 'Email processed', data: { messageId } };
  }
}
