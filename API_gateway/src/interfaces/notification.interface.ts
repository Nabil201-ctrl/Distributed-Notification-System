// Interface for email notification request
export interface EmailRequest {
  user_id: string;
  template_id: string;
  variables: Record<string, any>;
}

// Interface for push notification request  
export interface PushRequest {
  user_id: string;
  template_id: string;
  variables: Record<string, any>;
}

export interface QueueMessage {
  correlation_id: string;
  user_id?: string;
  recipient: string;
  template_id?: string;
  variables?: Record<string, any>;
  type: 'email' | 'push';
  priority: 'low' | 'normal' | 'high';
  timestamp: string;
  metadata?: Record<string, any>;
}

export interface NotificationStatus {
  correlation_id: string;
  status: 'queued' | 'processing' | 'sent' | 'failed' | 'bounced';
  type: 'email' | 'push';
  user_id: string;
  created_at: string;
  updated_at: string;
  sent_at?: string;
  retry_count: number;
  error_message?: string;
  metadata?: Record<string, any>;
}