# Distributed Notification System (Stage 4 - Backend Task)

## Overview

This project is a distributed notification system built using NestJS
microservices and RabbitMQ as the message broker.\
The system handles email and push notifications asynchronously while
maintaining scalability, reliability, and low latency.

It demonstrates microservice decomposition, event-driven communication,
and fault tolerance --- the core goals of Stage 4.

------------------------------------------------------------------------

## Goal & Objective

To build a distributed system that: - Sends emails and push
notifications using separate microservices. - Uses RabbitMQ (or Kafka)
for asynchronous message passing. - Handles failures gracefully with
retry, dead-letter queues, and circuit breakers. - Supports horizontal
scaling and service discovery.

------------------------------------------------------------------------

## Microservices Architecture

### 1. API Gateway Service

-   Entry point for all requests.
-   Validates & authenticates requests.
-   Publishes notification jobs to RabbitMQ.
-   Tracks notification status.

### 2. User Service

-   Manages user contact info (emails, device tokens).
-   Stores user preferences.
-   Provides REST APIs for user data and permissions.

### 3. Email Service

-   Consumes messages from the `email_queue`.
<<<<<<< HEAD
-   Fills templates using variables (e.g.Â `{{name}}`).
=======
-   Fills templates using variables (e.g. `{{name}}`).
>>>>>>> 6a44665 (feat(api-gateway): initial setup with RabbitMQ integration)
-   Sends emails using SMTP or providers like SendGrid/Mailgun.
-   Handles delivery confirmations and bounces.

### 4. Push Service

-   Consumes messages from the `push_queue`.
-   Sends web/mobile push notifications using FCM or OneSignal.
-   Validates device tokens and supports rich notifications.

### 5. Template Service

-   Stores and manages templates (supports multiple languages and
    versions).
-   Handles variable substitution.

------------------------------------------------------------------------

## Message Queue Setup (RabbitMQ)

**Exchange:** `notifications.direct`

<<<<<<< HEAD
Queues: - `email.queue` â†’ Email Service - `push.queue` â†’ Push Service -
`failed.queue` â†’ Dead Letter Queue
=======
Queues: - `email.queue` → Email Service - `push.queue` → Push Service -

`failed.queue` → Dead Letter Queue
>>>>>>> 6a44665 (feat(api-gateway): initial setup with RabbitMQ integration)

------------------------------------------------------------------------

## Response Format

``` json
{
  "success": true,
  "data": {},
  "error": null,
  "message": "Notification sent successfully",
  "meta": {
    "total": 100,
    "limit": 10,
    "page": 1,
    "total_pages": 10,
    "has_next": true,
    "has_previous": false
  }
}
```

------------------------------------------------------------------------

## Key Technical Concepts

### 1. Circuit Breaker

Prevents total system failure when external services (SMTP or FCM) go
down.

### 2. Retry System

Retries failed messages using exponential backoff. Permanently failed
ones go to the dead-letter queue.

### 3. Service Discovery

Allows microservices to find and communicate with each other
dynamically.

### 4. Health Checks

Each service exposes a `/health` endpoint to report its status.

### 5. Idempotency

Prevents duplicate notifications using unique request IDs.

### 6. Communication

-   **Synchronous (REST):** User preference lookups, template retrieval,
    status queries.
-   **Asynchronous (RabbitMQ):** Notification processing, retries,
    status updates.

------------------------------------------------------------------------

## Data Storage Strategy

Each service uses its own database: - **User Service:** PostgreSQL (user
data, preferences) - **Template Service:** PostgreSQL (templates,
versions) - **Notification Services:** Local cache + shared status
store - **Shared Tools:** Redis for caching preferences and RabbitMQ for
async communication

------------------------------------------------------------------------

## Failure Handling

-   **Service Failures:** Circuit breaker prevents cascading failures.
-   **Message Failures:** Retries + dead-letter queue.
-   **Network Issues:** Local cache for temporary resilience.

------------------------------------------------------------------------

## Monitoring & Logs

Track: - Message rate per queue - Service response times - Error rates -
Queue lag

Use correlation IDs to trace the lifecycle of each notification.

------------------------------------------------------------------------

## Performance Targets

-   Handle over 1,000 notifications/minute
-   API Gateway response time under 100ms
-   99.5% delivery success rate
-   All services support horizontal scaling

------------------------------------------------------------------------

## Recommended Tech Stack

-   **Language:** NestJS (Node.js)
-   **Queue:** RabbitMQ or Kafka
-   **Database:** PostgreSQL + Redis
-   **Containerization:** Docker
-   **API Docs:** Swagger or OpenAPI

------------------------------------------------------------------------

## Stage 4 Rules & Requirements

-   Teams of 4 members.
-   CI/CD workflow required for deployment.
-   Naming convention: **snake_case** for requests, responses, and
    models.
-   Deadline: **Wednesday, 12th November 2025, 11:59 PM (GMT+1)**.
-   Be prepared to present your work; any team member may be asked
    questions.

------------------------------------------------------------------------
