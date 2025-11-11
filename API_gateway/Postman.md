# Postman Test Scenarios for API Gateway

This document outlines Postman test scenarios for the API Gateway. Before running these tests, ensure the API Gateway is running and its dependencies (RabbitMQ, Redis) are accessible.

## Prerequisites

1.  **Start the API Gateway:**
    Navigate to the `API_gateway` directory and run:
    ```bash
    npm install
    npm run start:dev
    ```
    The API Gateway should be running on `http://localhost:3000` by default.

2.  **Ensure RabbitMQ and Redis are running:**
    The `/health` endpoint will indicate their status.

3.  **Use a tool like Postman or Insomnia** to send these HTTP requests.

---

## API Endpoints Summary

### 1. `GET /health`
*   **Description:** Checks the health of RabbitMQ and Redis services.
*   **Method:** `GET`
*   **Request Body:** None
*   **Expected Response:**
    ```json
    {
      "status": "healthy" | "unhealthy",
      "timestamp": "ISO_DATE_STRING",
      "services": {
        "rabbitmq": true | false,
        "redis": true | false
      }
    }
    ```

### 2. `POST /send_email`
*   **Description:** Queues an email notification.
*   **Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
      "user_id": "string",
      "template_id": "string",
      "variables": {
        "key": "value"
      }
    }
    ```
*   **Expected Response (Success):**
    ```json
    {
      "success": true,
      "correlation_id": "string",
      "message": "Email notification queued successfully"
    }
    ```
*   **Expected Response (Error):**
    ```json
    {
      "success": false,
      "error": "Error message"
    }
    ```

### 3. `POST /send_push`
*   **Description:** Queues a push notification.
*   **Method:** `POST`
*   **Request Body (JSON):**
    ```json
    {
      "user_id": "string",
      "template_id": "string",
      "variables": {
        "key": "value"
      }
    }
    ```
*   **Expected Response (Success):**
    ```json
    {
      "success": true,
      "correlation_id": "string",
      "message": "Push notification queued successfully"
    }
    ```
*   **Expected Response (Error):**
    ```json
    {
      "success": false,
      "error": "Error message"
    }
    ```

### 4. `GET /status/:correlation_id`
*   **Description:** Retrieves the status of a notification using its correlation ID.
*   **Method:** `GET`
*   **Request Body:** None
*   **Path Parameter:** `correlation_id` (string)
*   **Expected Response (Success):**
    ```json
    {
      "success": true,
      "data": {
        "correlation_id": "string",
        "type": "email" | "push",
        "user_id": "string",
        "status": "queued" | "sent" | "failed",
        "timestamp": "ISO_DATE_STRING"
      }
    }
    ```
*   **Expected Response (Not Found):**
    ```json
    {
      "success": false,
      "error": "Notification not found"
    }
    ```
*   **Expected Response (Error):**
    ```json
    {
      "success": false,
      "error": "Failed to get notification status"
    }
    ```

---

## Postman Test Scenarios

### Scenario 1: Check Health Endpoint

*   **Request:**
    *   Method: `GET`
    *   URL: `http://localhost:3000/health`
*   **Expected Response:**
    *   Status: `200 OK`
    *   Body (example):
        ```json
        {
          "status": "healthy",
          "timestamp": "2023-10-27T10:00:00.000Z",
          "services": {
            "rabbitmq": true,
            "redis": true
          }
        }
        ```
        *(Note: `rabbitmq` and `redis` status depend on their actual health)*

### Scenario 2: Send Email Notification (Success)

*   **Request:**
    *   Method: `POST`
    *   URL: `http://localhost:3000/send_email`
    *   Headers: `Content-Type: application/json`
    *   Body (raw JSON):
        ```json
        {
          "user_id": "user123",
          "template_id": "welcome_email",
          "variables": {
            "username": "John Doe",
            "app_name": "My App"
          }
        }
        ```
*   **Expected Response:**
    *   Status: `201 Created`
    *   Body (example):
        ```json
        {
          "success": true,
          "correlation_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
          "message": "Email notification queued successfully"
        }
        ```
        *(Save the `correlation_id` from the response for Scenario 4)*

### Scenario 3: Send Push Notification (Success)

*   **Request:**
    *   Method: `POST`
    *   URL: `http://localhost:3000/send_push`
    *   Headers: `Content-Type: application/json`
    *   Body (raw JSON):
        ```json
        {
          "user_id": "user456",
          "template_id": "promo_push",
          "variables": {
            "discount": "15%",
            "item": "new product"
          }
        }
        ```
*   **Expected Response:**
    *   Status: `201 Created`
    *   Body (example):
        ```json
        {
          "success": true,
          "correlation_id": "f0e9d8c7-b6a5-4321-fedc-ba9876543210",
          "message": "Push notification queued successfully"
        }
        ```
        *(Save the `correlation_id` from the response for Scenario 4)*

### Scenario 4: Get Notification Status (Success)

*   **Request:**
    *   Method: `GET`
    *   URL: `http://localhost:3000/status/a1b2c3d4-e5f6-7890-1234-567890abcdef` (Replace with an actual `correlation_id` obtained from Scenario 2 or 3)
*   **Expected Response:**
    *   Status: `200 OK`
    *   Body (example):
        ```json
        {
          "success": true,
          "data": {
            "correlation_id": "a1b2c3d4-e5f6-7890-1234-567890abcdef",
            "type": "email",
            "user_id": "user123",
            "status": "queued",
            "timestamp": "2023-10-27T10:01:00.000Z"
          }
        }
        ```
        *(The `status` field might be `sent` or `failed` depending on the downstream services processing the notification)*

### Scenario 5: Get Notification Status (Not Found)

*   **Request:**
    *   Method: `GET`
    *   URL: `http://localhost:3000/status/non_existent_id`
*   **Expected Response:**
    *   Status: `404 Not Found`
    *   Body:
        ```json
        {
          "success": false,
          "error": "Notification not found"
        }
        ```
