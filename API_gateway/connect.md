# RabbitMQ Queue Integration

This document outlines how the RabbitMQ message queue is used within the Distributed Notification System, focusing on its structure, how to connect, and how to interact with it for sending and receiving notifications.

## 1. How the Queue Works

The system utilizes RabbitMQ to asynchronously process notification requests (email and push notifications).

-   **Exchange:** `notifications.direct`
    -   **Type:** `direct`
    -   **Purpose:** This exchange acts as the central point for publishing notification messages. Messages are routed to specific queues based on a routing key.
-   **Queues:**
    -   `email.queue`: Dedicated queue for email notification requests.
    -   `push.queue`: Dedicated queue for push notification requests.
    -   **Durability:** Both queues are configured as `durable`, meaning they will survive a RabbitMQ broker restart.
-   **Bindings:**
    -   `email.queue` is bound to `notifications.direct` with the routing key `email`.
    -   `push.queue` is bound to `notifications.direct` with the routing key `push`.

This setup ensures that messages published to `notifications.direct` with a routing key of `email` go to `email.queue`, and similarly for `push` messages to `push.queue`.

## 2. Connecting to RabbitMQ

The `RabbitMQService` handles the connection to the RabbitMQ broker. It uses the `amqplib` library and retrieves the RabbitMQ connection URL from the application's configuration (`RABBITMQ_URL`).

### Connection Establishment

The `connect()` method performs the following steps:

1.  Establishes a connection to the RabbitMQ server.
2.  Creates a channel for communication.
3.  Asserts the existence of the `notifications.direct` exchange.
4.  Asserts the existence of `email.queue` and `push.queue`.
5.  Binds the queues to the exchange with their respective routing keys.

```typescript
import amqp from 'amqplib';

async function connectToRabbitMQ(rabbitmqUrl: string) {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertExchange('notifications.direct', 'direct', { durable: true });
    await channel.assertQueue('email.queue', { durable: true });
    await channel.assertQueue('push.queue', { durable: true });
    await channel.bindQueue('email.queue', 'notifications.direct', 'email');
    await channel.bindQueue('push.queue', 'notifications.direct', 'push');

    console.log('Successfully connected to RabbitMQ and asserted topology.');
    return { connection, channel };
  } catch (error) {
    console.error('Failed to connect to RabbitMQ:', error);
    throw error;
  }
}
```

## 3. Getting Data from the Queue (Consuming Messages)

While the API Gateway primarily publishes messages, other services (e.g., an Email Service or Push Notification Service) will consume messages from these queues.

To consume messages, a service would typically:

1.  Connect to RabbitMQ and create a channel (as shown above).
2.  Assert the queue it intends to consume from (e.g., `email.queue`).
3.  Call `channel.consume()` on the desired queue, providing a callback function to process each message.

```typescript
import amqp from 'amqplib';

async function consumeMessages(rabbitmqUrl: string, queueName: string, messageHandler: (msg: amqp.ConsumeMessage | null) => void) {
  try {
    const connection = await amqp.connect(rabbitmqUrl);
    const channel = await connection.createChannel();

    await channel.assertQueue(queueName, { durable: true });

    console.log(`Waiting for messages in ${queueName}. To exit press CTRL+C`);

    channel.consume(queueName, (msg) => {
      if (msg !== null) {
        messageHandler(msg);
        channel.ack(msg); // Acknowledge the message to remove it from the queue
      }
    }, {
      noAck: false // Ensure messages are acknowledged manually
    });

  } catch (error) {
    console.error(`Failed to consume from ${queueName}:`, error);
    throw error;
  }
}

// Example usage for an email service
// consumeMessages('amqp://localhost', 'email.queue', (msg) => {
//   console.log("Received email message:", JSON.parse(msg!.content.toString()));
//   // Process email notification
// });
```

## 3.1. Key Concepts for Consumers

When working with RabbitMQ as a consumer, several key concepts are crucial for understanding message flow and reliable processing:

-   **Consumer:** An application or service that receives and processes messages from a RabbitMQ queue.
-   **Queue:** A buffer that stores messages. Consumers retrieve messages from queues.
-   **Exchange:** Receives messages from producers and routes them to queues based on rules (bindings and routing keys).
-   **Binding:** A link between an exchange and a queue, defined by a routing key.
-   **Routing Key:** A message attribute that an exchange uses to decide how to route the message to queues.
-   **Acknowledgement (Ack):** A signal sent by the consumer to RabbitMQ to confirm that a message has been successfully received and processed. This tells RabbitMQ it can safely delete the message from the queue.
-   **`noAck` (auto-acknowledgement):** A consumer setting. If `true`, RabbitMQ automatically acknowledges messages as soon as they are delivered. If `false` (recommended for reliability), the consumer must explicitly send an `ack`.
-   **Durable Queue:** A queue that will survive a RabbitMQ broker restart. Messages in durable queues are also persistent if published as such.

## 4. Other Processes: Publishing Messages

The `RabbitMQService` provides a `publishMessage` method to send notification requests to the appropriate queue via the `notifications.direct` exchange.

```typescript
import { Channel } from 'amqplib';

interface QueueMessage {
  // Define your message structure here, e.g.:
  recipient: string;
  subject?: string;
  body: string;
  // ... other relevant fields
}

async function publishNotificationMessage(
  channel: Channel,
  type: 'email' | 'push',
  message: QueueMessage
): Promise<boolean> {
  const routingKey = type;
  const messageBuffer = Buffer.from(JSON.stringify(message));

  // Publish to the 'notifications.direct' exchange with the specific routing key
  return channel.publish('notifications.direct', routingKey, messageBuffer, { persistent: true });
}

// Example usage within the API Gateway
// const messageToSend: QueueMessage = {
//   recipient: 'user@example.com',
//   subject: 'Welcome!',
//   body: 'Hello, welcome to our service!'
// };
// await publishNotificationMessage(this.channel, 'email', messageToSend);
```

Messages are published with the `persistent: true` option, which instructs RabbitMQ to save the message to disk, ensuring it survives a broker restart until it is delivered to a consumer.

## 5. Disconnecting from RabbitMQ

The `disconnect()` method safely closes the channel and connection to RabbitMQ. This is typically called when the application is shutting down.

```typescript
import { Connection, Channel } from 'amqplib';

async function disconnectFromRabbitMQ(connection: Connection, channel: Channel): Promise<void> {
  try {
    if (channel) await channel.close();
    if (connection) await connection.close();
    console.log('Disconnected from RabbitMQ');
  } catch (err) {
    console.error('Error while disconnecting from RabbitMQ:', err);
  }
}
```
