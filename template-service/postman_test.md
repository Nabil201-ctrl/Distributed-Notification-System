# Postman Test Cases for Template Service

This document provides sample Postman test cases for the `template-service` microservice. These examples assume the service is running locally on `http://localhost:3000` and the base path for the template API is `/template`.

## Base URL

`http://localhost:3000`

## Collection Variables

You might want to set up a collection variable for the base URL, e.g., `{{baseUrl}} = http://localhost:3000`.

---

## 1. Get All Templates

**Request:**
- **Method:** `GET`
- **URL:** `{{baseUrl}}/template`
- **Headers:**
  - `Content-Type`: `application/json`

**Expected Response (200 OK):**
```json
[
  {
    "id": "uuid-1",
    "name": "Welcome Email",
    "subject": "Welcome to our service!",
    "body": "Hello {{name}}, thank you for signing up.",
    "createdAt": "2023-01-01T10:00:00.000Z",
    "updatedAt": "2023-01-01T10:00:00.000Z"
  },
  {
    "id": "uuid-2",
    "name": "Password Reset",
    "subject": "Reset your password",
    "body": "Dear user, click here to reset your password: {{resetLink}}",
    "createdAt": "2023-01-02T11:00:00.000Z",
    "updatedAt": "2023-01-02T11:00:00.000Z"
  }
]
```

**Postman Test Script (under "Tests" tab):**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an array", function () {
    pm.expect(pm.response.json()).to.be.an('array');
});

pm.test("Each template has required properties", function () {
    const responseJson = pm.response.json();
    responseJson.forEach(template => {
        pm.expect(template).to.have.property('id');
        pm.expect(template).to.have.property('name');
        pm.expect(template).to.have.property('subject');
        pm.expect(template).to.have.property('body');
    });
});
```

---

## 2. Get Template by ID

**Request:**
- **Method:** `GET`
- **URL:** `{{baseUrl}}/template/:id` (Replace `:id` with an actual template ID, e.g., `uuid-1`)
- **Headers:**
  - `Content-Type`: `application/json`

**Expected Response (200 OK):**
```json
{
  "id": "uuid-1",
  "name": "Welcome Email",
  "subject": "Welcome to our service!",
  "body": "Hello {{name}}, thank you for signing up.",
  "createdAt": "2023-01-01T10:00:00.000Z",
  "updatedAt": "2023-01-01T10:00:00.000Z"
}
```

**Postman Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Response is an object", function () {
    pm.expect(pm.response.json()).to.be.an('object');
});

pm.test("Template has correct ID", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.id).to.eql(pm.environment.get("templateId")); // Assuming templateId is set from a previous POST request
});
```

---

## 3. Create New Template

**Request:**
- **Method:** `POST`
- **URL:** `{{baseUrl}}/template`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
```json
{
  "name": "Order Confirmation",
  "subject": "Your order #{{orderId}} has been confirmed!",
  "body": "Hi {{customerName}}, your order with items {{items}} is confirmed and will be shipped soon."
}
```

**Expected Response (201 Created):**
```json
{
  "id": "new-uuid-generated",
  "name": "Order Confirmation",
  "subject": "Your order #{{orderId}} has been confirmed!",
  "body": "Hi {{customerName}}, your order with items {{items}} is confirmed and will be shipped soon.",
  "createdAt": "2023-01-03T12:00:00.000Z",
  "updatedAt": "2023-01-03T12:00:00.000Z"
}
```

**Postman Test Script:**
```javascript
pm.test("Status code is 201", function () {
    pm.response.to.have.status(201);
});

pm.test("Response has an ID", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson).to.have.property('id');
    pm.environment.set("templateId", responseJson.id); // Save ID for subsequent tests
});

pm.test("Template name matches", function () {
    pm.expect(pm.response.json().name).to.eql("Order Confirmation");
});
```

---

## 4. Update Template (PATCH)

**Request:**
- **Method:** `PATCH`
- **URL:** `{{baseUrl}}/template/:id` (Replace `:id` with an actual template ID, e.g., `{{templateId}}` from previous POST)
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON):**
```json
{
  "subject": "Updated: Your order #{{orderId}} has been confirmed!"
}
```

**Expected Response (200 OK):**
```json
{
  "id": "new-uuid-generated",
  "name": "Order Confirmation",
  "subject": "Updated: Your order #{{orderId}} has been confirmed!",
  "body": "Hi {{customerName}}, your order with items {{items}} is confirmed and will be shipped soon.",
  "createdAt": "2023-01-03T12:00:00.000Z",
  "updatedAt": "2023-01-03T12:05:00.000Z" // Updated timestamp
}
```

**Postman Test Script:**
```javascript
pm.test("Status code is 200", function () {
    pm.response.to.have.status(200);
});

pm.test("Subject has been updated", function () {
    pm.expect(pm.response.json().subject).to.eql("Updated: Your order #{{orderId}} has been confirmed!");
});
```

---

## 5. Delete Template

**Request:**
- **Method:** `DELETE`
- **URL:** `{{baseUrl}}/template/:id` (Replace `:id` with an actual template ID, e.g., `{{templateId}}`)
- **Headers:**
  - `Content-Type`: `application/json`

**Expected Response (200 OK or 204 No Content):**
- If 200 OK, typically an empty object or a success message.
- If 204 No Content, no body is returned.

**Postman Test Script:**
```javascript
pm.test("Status code is 200 or 204", function () {
    pm.expect(pm.response.code).to.be.oneOf([200, 204]);
});

// Optional: Verify deletion by trying to GET the template again
// This would require a chained request or a separate test.
```

---

## Error Handling Examples

### 1. Get Non-Existent Template

**Request:**
- **Method:** `GET`
- **URL:** `{{baseUrl}}/template/non-existent-id`
- **Headers:**
  - `Content-Type`: `application/json`

**Expected Response (404 Not Found):**
```json
{
  "statusCode": 404,
  "message": "Template with ID 'non-existent-id' not found",
  "error": "Not Found"
}
```

**Postman Test Script:**
```javascript
pm.test("Status code is 404", function () {
    pm.response.to.have.status(404);
});

pm.test("Error message indicates not found", function () {
    pm.expect(pm.response.json().message).to.include("not found");
});
```

### 2. Create Template with Invalid Data

**Request:**
- **Method:** `POST`
- **URL:** `{{baseUrl}}/template`
- **Headers:**
  - `Content-Type`: `application/json`
- **Body (raw JSON - missing required 'name'):**
```json
{
  "subject": "Invalid Template",
  "body": "This template is missing a name."
}
```

**Expected Response (400 Bad Request):**
```json
{
  "statusCode": 400,
  "message": [
    "name should not be empty",
    "name must be a string"
  ],
  "error": "Bad Request"
}
```

**Postman Test Script:**
```javascript
pm.test("Status code is 400", function () {
    pm.response.to.have.status(400);
});

pm.test("Error message indicates validation failure", function () {
    const responseJson = pm.response.json();
    pm.expect(responseJson.message).to.be.an('array').and.to.include("name should not be empty");
});
```