import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
  UseGuards,
  Headers,
  UnauthorizedException,
  BadRequestException
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBody,
  ApiCreatedResponse,
  ApiBadRequestResponse,
  ApiInternalServerErrorResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiQuery,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import { CorrelationId } from '../decorators/correlation-id.decorator';
import { Public } from '../decorators/public.decorator';
import { RabbitMQService } from '../services/rabbitmq.service';
import { NotificationTrackerService } from '../services/notification-tracker.service';
import { UserServiceClient } from '../services/user-service-client.service';
import { EmailRequestDto } from '../dto/email-request.dto';
import { PushRequestDto } from '../dto/push-request.dto';
import { NotificationQueuedResponseDto } from '../dto/notification-queued-response.dto';
import { ErrorResponseDto } from '../dto/error-response.dto';
import { NotificationStatusResponseDto } from '../dto/notification-status-response.dto';
import type { QueueMessage } from '../interfaces/notification.interface';


@ApiTags('notifications')
@Controller('notifications')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class NotificationController {
  constructor(
    private readonly rabbitMQService: RabbitMQService,
    private readonly trackerService: NotificationTrackerService,
    private readonly userServiceClient: UserServiceClient,
  ) { }

  @Post('send_email')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue an email notification',
    description: 'Requires valid JWT token. Can send to direct email or user_id (checks preferences).'
  })
  @ApiBody({ type: EmailRequestDto })
  @ApiCreatedResponse({
    description: 'Email notification queued successfully.',
    type: NotificationQueuedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the request body.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to reach queue or datastore.',
    type: ErrorResponseDto,
  })
  async sendEmail(
    @Body() request: EmailRequestDto,
    @CurrentUser() user: any,
    @CorrelationId() correlationId: string,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      // Validate request
      this.validateEmailRequest(request);

      if (!authHeader) {
        throw new UnauthorizedException('Missing Authorization header');
      }

      const token = authHeader.split(' ')[1];
      if (!token) {
        throw new UnauthorizedException('Invalid Authorization header');
      }

      if (!user) {
        throw new UnauthorizedException('User not found in request');
      }


      let userEmail = request.to;
      let checkPreferences = false;
      let actualUserId = request.user_id || user.id;

      // If user_id provided, check preferences and get email from User Service
      if (request.user_id) {
        try {
          // Forward JWT to User Service (Gateway doesn't authenticate itself)
          const userInfo = await this.userServiceClient.getUserContactInfo(
            request.user_id,
            token,
          );

          // Check if user has email enabled
          if (!userInfo.preferences.email) {
            return {
              success: false,
              error: 'User has disabled email notifications',
              message: 'Email notification not allowed',
            };
          }

          userEmail = userInfo.email;
          checkPreferences = true;
        } catch (error) {
          // If user service fails, fall back to provided email if available
          if (!request.to) {
            throw new HttpException(
              {
                success: false,
                error: error.message,
                message: 'Failed to get user info and no direct email provided',
              },
              HttpStatus.BAD_REQUEST,
            );
          }
          console.warn('Failed to get user info, using provided email:', error.message);
        }
      }

      // Use provided correlation ID or generate new one
      const notificationId = correlationId || this.trackerService.generateCorrelationId();

      if (!userEmail) {
        throw new BadRequestException('User does not have a valid email');
      }

      // Prepare message for RabbitMQ
      const message: QueueMessage = {
        correlation_id: notificationId,
        user_id: actualUserId,
        recipient: userEmail,
        template_id: request.template_id,
        variables: request.variables,
        type: 'email',
        priority: request.priority || 'normal',
        timestamp: new Date().toISOString(),
        metadata: {
          subject: request.subject,
          body: request.body,
          template_name: request.template_name,
          sent_by: user.id, // Track who sent it
        },
      };

      // Publish to email queue
      const published = await this.rabbitMQService.publishMessage('email', message);

      if (published) {
        // Record in tracker
        await this.trackerService.recordNotificationQueued(
          notificationId,
          'email',
          actualUserId,
          {
            recipient: userEmail,
            subject: request.subject,
            preferences_checked: checkPreferences,
            sent_by: user.id,
          },
        );

        return {
          success: true,
          correlation_id: notificationId,
          message: 'Email notification queued successfully',
          queued_at: new Date().toISOString(),
        };
      } else {
        throw new Error('Failed to publish message to queue');
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          error: error.message,
          message: 'Failed to queue email notification',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Post('send_push')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    summary: 'Queue a push notification',
    description: 'Requires valid JWT token and user_id. Checks user preferences and fetches push token.'
  })
  @ApiBody({ type: PushRequestDto })
  @ApiCreatedResponse({
    description: 'Push notification queued successfully.',
    type: NotificationQueuedResponseDto,
  })
  @ApiBadRequestResponse({
    description: 'Validation failed for the request body.',
    type: ErrorResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
  })
  @ApiInternalServerErrorResponse({
    description: 'Failed to reach queue or datastore.',
    type: ErrorResponseDto,
  })
  async sendPush(
    @Body() request: PushRequestDto,
    @CurrentUser() user: any,
    @CorrelationId() correlationId: string,
    @Headers('authorization') authHeader: string,
  ) {
    try {
      // Validate request
      this.validatePushRequest(request);

      // Extract token to forward to User Service
      const token = authHeader?.split(' ')[1];

      if (!request.user_id) {
        throw new HttpException(
          {
            success: false,
            error: 'user_id is required for push notifications',
          },
          HttpStatus.BAD_REQUEST,
        );
      }

      // Forward JWT to User Service to get contact info
      const userInfo = await this.userServiceClient.getUserContactInfo(
        request.user_id,
        token,
      );

      // Check if user has push enabled
      if (!userInfo.preferences.push) {
        return {
          success: false,
          error: 'User has disabled push notifications',
          message: 'Push notification not allowed',
        };
      }

      // Check if user has push token
      if (!userInfo.push_token) {
        return {
          success: false,
          error: 'User has no push token registered',
          message: 'Push notification failed - no device registered',
        };
      }

      // Use provided correlation ID or generate new one
      const notificationId = correlationId || this.trackerService.generateCorrelationId();

      // Prepare message for RabbitMQ
      const message: QueueMessage = {
        correlation_id: notificationId,
        user_id: request.user_id,
        recipient: request.user_id,
        template_id: request.template_id,
        variables: request.variables,
        type: 'push',
        priority: request.priority || 'normal',
        timestamp: new Date().toISOString(),
        metadata: {
          title: request.title,
          body: request.body,
          image: request.image,
          click_action: request.click_action,
          data: request.data,
          push_token: userInfo.push_token,
          sent_by: user.id, // Track who sent it
        },
      };

      // Publish to push queue
      const published = await this.rabbitMQService.publishMessage('push', message);

      if (published) {
        // Record in tracker
        await this.trackerService.recordNotificationQueued(
          notificationId,
          'push',
          request.user_id,
          {
            title: request.title,
            has_push_token: true,
            sent_by: user.id,
          },
        );

        return {
          success: true,
          correlation_id: notificationId,
          message: 'Push notification queued successfully',
          queued_at: new Date().toISOString(),
        };
      } else {
        throw new Error('Failed to publish message to queue');
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          error: error.message,
          message: 'Failed to queue push notification',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('status/:correlation_id')
  @ApiOperation({ summary: 'Get notification status by correlation ID' })
  @ApiOkResponse({
    description: 'Notification status retrieved successfully.',
    type: NotificationStatusResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'Notification not found.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
  })
  async getStatus(@Param('correlation_id') correlationId: string) {
    try {
      const status = await this.trackerService.getNotificationStatus(correlationId);

      if (!status) {
        throw new HttpException(
          {
            success: false,
            error: 'Notification not found',
            message: 'No notification found with the provided correlation ID',
          },
          HttpStatus.NOT_FOUND,
        );
      }

      return {
        success: true,
        data: status,
        message: 'Notification status retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          error: 'Failed to get notification status',
          message: error.message,
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('user/:user_id')
  @ApiOperation({ summary: 'Get notifications for a specific user' })
  @ApiQuery({ name: 'page', required: false, example: 1 })
  @ApiQuery({ name: 'limit', required: false, example: 10 })
  @ApiOkResponse({
    description: 'User notifications retrieved successfully.',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
  })
  async getUserNotifications(
    @Param('user_id') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
    @CurrentUser() user: any,
  ) {
    try {
      // Users can only see their own notifications (unless admin)
      if (user.role !== 'admin' && user.id !== userId) {
        throw new HttpException(
          {
            success: false,
            error: 'Access denied',
            message: 'You can only view your own notifications',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const notifications = await this.trackerService.getUserNotifications(
        userId,
        Number(page),
        Number(limit),
      );

      return {
        success: true,
        data: notifications.data,
        meta: notifications.meta,
        message: 'User notifications retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          error: error.message,
          message: 'Failed to retrieve user notifications',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get notification statistics (Admin only)' })
  @ApiOkResponse({ description: 'Statistics retrieved successfully' })
  @ApiUnauthorizedResponse({
    description: 'Invalid or missing JWT token',
  })
  async getStatistics(@CurrentUser() user: any) {
    try {
      // Only admins can view statistics
      if (user.role !== 'admin') {
        throw new HttpException(
          {
            success: false,
            error: 'Access denied',
            message: 'Admin role required',
          },
          HttpStatus.FORBIDDEN,
        );
      }

      const stats = await this.trackerService.getStatistics();
      const queueStats = await this.rabbitMQService.getQueueStats();

      return {
        success: true,
        data: {
          notifications: stats,
          queues: queueStats,
        },
        message: 'Statistics retrieved successfully',
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      throw new HttpException(
        {
          success: false,
          error: error.message,
          message: 'Failed to retrieve statistics',
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  // Validation methods
  private validateEmailRequest(request: EmailRequestDto): void {
    if (!request.to && !request.user_id) {
      throw new HttpException(
        {
          success: false,
          error: 'Either "to" (email) or "user_id" is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!request.subject && !request.template_id) {
      throw new HttpException(
        {
          success: false,
          error: 'Either "subject" or "template_id" is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!request.body && !request.template_id) {
      throw new HttpException(
        {
          success: false,
          error: 'Either "body" or "template_id" is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }

  private validatePushRequest(request: PushRequestDto): void {
    if (!request.user_id) {
      throw new HttpException(
        {
          success: false,
          error: 'user_id is required for push notifications',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!request.title) {
      throw new HttpException(
        {
          success: false,
          error: 'title is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }

    if (!request.body && !request.template_id) {
      throw new HttpException(
        {
          success: false,
          error: 'Either "body" or "template_id" is required',
        },
        HttpStatus.BAD_REQUEST,
      );
    }
  }
}