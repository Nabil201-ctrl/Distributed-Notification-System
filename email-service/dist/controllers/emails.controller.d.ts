import { EmailLogService } from '../services/email-log.service';
import { EmailLogResponseDto } from '../dto/email-log-response.dto';
export declare class EmailsController {
    private readonly emailLogService;
    constructor(emailLogService: EmailLogService);
    getEmailByMessageId(messageId: string): EmailLogResponseDto;
}
