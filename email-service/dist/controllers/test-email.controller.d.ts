import { EmailProcessorService } from '../services/email-processor.service';
import { TestEmailDto } from '../dto/test-email.dto';
export declare class TestEmailController {
    private readonly emailProcessor;
    constructor(emailProcessor: EmailProcessorService);
    testSend(payload: TestEmailDto): Promise<{
        success: boolean;
        message: string;
        data: {
            messageId: string | undefined;
        };
    }>;
}
