# Distributed Notification System - Clear Guide

## API Gateway (NestJS, Nabil)

**Purpose:** Entry point for clients, validate requests, publish to RabbitMQ, track status.

### Routes
| Route | Method | Why | Notes |
|-------|--------|-----|-------|
| /send_email | POST | Client requests to send email | Body: { user_id, template_id, variables } → publish to email.queue |
| /send_push | POST | Client requests to send push | Body: { user_id, template_id, variables } → publish to push.queue |
| /status/:correlation_id | GET | Check if a notification was sent | Read from Redis / NotificationLog (cached statuses) |
| /health | GET | Monitor API Gateway status | Simple "healthy" response |

**Database:**
- Minimal, only for tracking correlation IDs and statuses
- Could use Redis for fast lookups

**Data Flow:**
- Accept client request → validate → assign correlation_id → publish to RabbitMQ
- Other services consume message asynchronously

## User Service (NestJS, Toluwa)

**Purpose:** Manage user info, email, push tokens, preferences.

### Routes
| Route | Method | Why | Notes |
|-------|--------|-----|-------|
| /users | POST | Add new user | Body: { full_name, email, password } |
| /users/:id | GET | Retrieve user info | Returns email, push tokens, preferences |
| /users/:id/preferences | PATCH | Update notification preferences | { email_enabled, push_enabled } |
| /users/:id/push_tokens | POST | Add device token | For push notifications |
| /health | GET | Service status | |

**Database:** PostgreSQL

**Tables:** users, notification_preferences, push_tokens

- Each service owns its DB; no other service reads it directly

**Data Flow:**
- API Gateway or Email/Push service calls REST to get user contact info (sync)

## Template Service (NestJS or Go)

**Purpose:** Store notification templates and handle variables.

### Routes
| Route | Method | Why | Notes |
|-------|--------|-----|-------|
| /templates | POST | Create template | { name, type, body, variables } |
| /templates/:id | GET | Fetch template | Used by Email/Push service |
| /templates/:id | PATCH | Update template | Maintain versions |
| /templates/:id/history | GET | Fetch previous versions | Versioning for audits |
| /health | GET | Service status | |

**Database:** PostgreSQL

**Tables:** templates, template_history

- Each service owns its DB

**Data Flow:**
- Email/Push service queries template via REST or receives full template in RabbitMQ payload (async)

## Email Service (Go, Thobbizs)

**Purpose:** Consume email messages from RabbitMQ, send emails, handle retries/DLX.

### Routes (internal/admin)
| Route | Method | Why |
|-------|--------|-----|
| /health | GET | Service status |
| /retry/:message_id | POST | Manually retry failed messages |

**Database:** Local DB or Redis

**Table:** notification_log → stores user_id, template_id, status, retry_count, correlation_id

**Data Flow:**
- Consume message from email.queue
- Fetch user email (optional) via User Service API
- Fetch template body (optional) via Template Service API
- Send email
- Update notification_log
- If fail → retry → DLX if max retries

## Push Service (Go, Thobbizs)

**Purpose:** Consume push notifications from RabbitMQ, send notifications, handle retries/DLX.

### Routes (internal/admin)
| Route | Method | Why |
|-------|--------|-----|
| /health | GET | Service status |
| /retry/:message_id | POST | Retry failed messages |

**Database:** Local DB or Redis

**Table:** notification_log → stores user_id, template_id, status, retry_count, correlation_id

**Data Flow:**
- Consume message from push.queue
- Fetch push token (optional) via User Service API
- Fetch template body (optional) via Template Service API
- Send push notification
- Update notification_log
- Retry/DLX if failed

## How Services Communicate

| From → To | Method | Notes |
|-----------|--------|-------|
| API Gateway → Email/Push | RabbitMQ async | Message includes: user_id, template_id, variables, correlation_id |
| Email/Push → User Service | REST sync | Fetch email/push token if not included in message |
| Email/Push → Template Service | REST sync | Fetch template body if not included in message |
| Email/Push → Dead Letter Queue | RabbitMQ async | For failed messages after max retries |

## Key Rules to Follow

- Each service owns its DB → never share tables across languages
- Use correlation IDs to track notification through all services
- Retry/DLX logic only in consumer services (Email/Push)
- Use REST for synchronous lookups (User/Template) and RabbitMQ for async notification delivery
- All endpoints should have /health for monitoring
- Use snake_case for all request and response fields
