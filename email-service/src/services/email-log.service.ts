import { Injectable } from '@nestjs/common';

export interface EmailLogRecord {
  messageId: string;
  userId: string;
  templateId: string;
  to: string;
  subject: string;
  variables: Record<string, any>;
  sentAt: string;
}

@Injectable()
export class EmailLogService {
  private readonly records = new Map<string, EmailLogRecord>();

  record(entry: EmailLogRecord) {
    this.records.set(entry.messageId, entry);
  }

  get(messageId: string): EmailLogRecord | undefined {
    return this.records.get(messageId);
  }
}
