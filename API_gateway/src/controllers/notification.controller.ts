import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  Param, 
  HttpException, 
  HttpStatus 
} from '@nestjs/common';
import { RabbitMQService } from '../services/rabbitmq.service';
import { NotificationTrackerService } from '../services/notification-tracker.service';
import type { QueueMessage } from '../interfaces/notification.interface';
import { ApiTags, ApiOperation, ApiResponse, ApiBody } from '@nestjs/swagger';
import { EmailRequestDto } from '../dto/email-request.dto';
import { PushRequestDto } from '../dto/push-request.dto';

@ApiTags('notifications')
@Controller()

export class NotificationController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly trackerService: NotificationTrackerService,
  ) {}

  // Send email notification
  @Post('send_email')
  @ApiOperation({ summary: 'Queue an email notification' })
  @ApiBody({ type: EmailRequestDto })
  @ApiResponse({ status: 201, description: 'Email notification queued successfully.'})
  @ApiResponse({ status: 500, description: 'Internal server error.'})
  async sendEmail(@Body() request: EmailRequestDto) {
    try {
      // Validate request
      this.validateRequest(request);

      // Generate correlation ID for tracking
      const correlationId = this.trackerService.generateCorrelationId();

      // Prepare message for RabbitMQ
      const message: QueueMessage = {
        correlation_id: correlationId,
        user_id: request.user_id,
        template_id: request.template_id,
        variables: request.variables,
        type: 'email',
        timestamp: new Date().toISOString()
      };

      // Publish to email queue
      const published = await this.rabbitMQService.publishMessage('email', message);
      
      if (published) {
        // Record in tracker
        await this.trackerService.recordNotificationQueued(correlationId, 'email', request.user_id);
        
        return {
          success: true,
          correlation_id: correlationId,
          message: 'Email notification queued successfully'
        };
      } else {
        throw new Error('Failed to publish message to queue');
      }

    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Send push notification
  @Post('send_push')
  @ApiOperation({ summary: 'Queue a push notification' })
  @ApiBody({ type: PushRequestDto })
  @ApiResponse({ status: 201, description: 'Push notification queued successfully.'})
  @ApiResponse({ status: 500, description: 'Internal server error.'})
  async sendPush(@Body() request: PushRequestDto) {
    try {
      // Validate request
      this.validateRequest(request);

      // Generate correlation ID for tracking
      const correlationId = this.trackerService.generateCorrelationId();

      // Prepare message for RabbitMQ
      const message: QueueMessage = {
        correlation_id: correlationId,
        user_id: request.user_id,
        template_id: request.template_id,
        variables: request.variables,
        type: 'push',
        timestamp: new Date().toISOString()
      };

      // Publish to push queue
      const published = await this.rabbitMQService.publishMessage('push', message);
      
      if (published) {
        // Record in tracker
        await this.trackerService.recordNotificationQueued(correlationId, 'push', request.user_id);
        
        return {
          success: true,
          correlation_id: correlationId,
          message: 'Push notification queued successfully'
        };
      } else {
        throw new Error('Failed to publish message to queue');
      }

    } catch (error) {
      throw new HttpException(
        {
          success: false,
          error: error.message
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Check notification status by correlation ID
  @Get('status/:correlation_id')
  @ApiOperation({ summary: 'Get notification status' })
  @ApiResponse({ status: 200, description: 'Notification status retrieved successfully.'})
  @ApiResponse({ status: 404, description: 'Notification not found.'})
  @ApiResponse({ status: 500, description: 'Internal server error.'})
  async getStatus(@Param('correlation_id') correlationId: string) {
    try {
      const status = await this.trackerService.getNotificationStatus(correlationId);
      
      if (!status) {
        throw new HttpException(
          {
            success: false,
            error: 'Notification not found'
          },
          HttpStatus.NOT_FOUND
        );
      }

      return {
        success: true,
        data: status
      };

    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      
      throw new HttpException(
        {
          success: false,
          error: 'Failed to get notification status'
        },
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Validate request parameters
  private validateRequest(request: any): void {
    if (!request.user_id) {
      throw new Error('user_id is required');
    }
    
    if (!request.template_id) {
      throw new Error('template_id is required');
    }
    
    if (!request.variables || typeof request.variables !== 'object') {
      throw new Error('variables must be an object');
    }
  }
}