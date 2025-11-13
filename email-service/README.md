## Email Service

This microservice consumes messages from `email.queue`, fetches user + template data, renders the template, and dispatches the email via the configured mail provider. It also reports status updates back to the API Gateway tracker.

### Environment Variables

Copy `.env.example` to `.env` and fill in:

| Variable | Description |
| --- | --- |
| `RABBITMQ_URL` | Connection string for RabbitMQ |
| `EMAIL_QUEUE` | Queue to consume (defaults to `email.queue`) |
| `TEMPLATE_SERVICE_URL` | Base URL for the template service |
| `USER_SERVICE_URL` | Base URL for the user service |
| `API_GATEWAY_URL` | URL used to PATCH notification statuses |
| `SERVICE_AUTH_TOKEN` | JWT or API key used for service-to-service auth |
| `EMAIL_FROM` | Default From header |

### Development

```bash
cd email-service
npm install
npm run start:dev
```

The service runs a hybrid HTTP + worker app:
- HTTP server on `PORT` (default 3003) exposes `/health`, `/test/send`, `/emails/:messageId`, and Swagger UI under `/docs`.
- Background worker consumes RabbitMQ queue jobs simultaneously.

### Production (example)

```bash
npm run build
NODE_ENV=production PORT=3003 node dist/main
```

### Notes

- `MailerService` is a stub — integrate SendGrid, SES, Mailgun, or any SMTP provider.
- Failed deliveries `nack` the message without requeueing; configure DLQ policies at the broker level as needed.
- `/test/send` lets you invoke the worker logic without publishing to RabbitMQ (useful for demos via Swagger).
- `/emails/:messageId` returns the metadata captured when an email job was sent (use the `messageId` returned from `/test/send` or produced by queue jobs).
