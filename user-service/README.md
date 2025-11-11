# User Service - User Management

A production-ready microservice built with NestJS for managing users and authentication.

## 🚀 Features

* ✅ **JWT Authentication** - Secure token-based authentication with refresh tokens
* ✅ **Role-Based Access Control (RBAC)** - USER, ADMIN, and SERVICE roles
* ✅ **User Management** - CRUD operations with authorization
* ✅ **PostgreSQL Database** - Robust data persistence with TypeORM
* ✅ **Health Checks** - Kubernetes-ready health endpoints
* ✅ **Swagger Documentation** - Interactive API documentation
* ✅ **Security** - Password hashing, token validation, input validation

## 📋 Tech Stack

* **Framework**: NestJS 10
* **Database**: PostgreSQL 15
* **Authentication**: JWT (Passport)
* **ORM**: TypeORM
* **Validation**: class-validator
* **Documentation**: Swagger/OpenAPI


## 🔧 Installation

### Prerequisites

* Node.js 18+
* PostgreSQL 15+

### Local Setup

```bash
git clone https://github.com/Nabil201-ctrl/Distributed-Notification-System.git
cd user-service
npm install

cp .env.example .env
# Edit .env with your configuration

# Run migrations
npm run migration:run

# Start application
npm run start:dev
```

## 📝 API Documentation

Access interactive Swagger documentation:

```
http://localhost:3001/api/docs
```

## 🔑 Authentication Flow

### 1. Register New User

```bash
POST /api/v1/users
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePass123!",
  "push_token": "fcm_token_optional"
}
```

### 2. Login

```bash
POST /auth/login
{
  "email": "john@example.com",
  "password": "SecurePass123!"
}
```

Response:

```json
{
  "access_token": "...",
  "refresh_token": "...",
  "expires_in": 3600,
  "user": { ... }
}
```

### 3. Use Access Token

```bash
GET /api/v1/users/:id
Authorization: Bearer <access_token>
```

### 4. Refresh Token

```bash
POST /auth/refresh
{
  "refresh_token": "..."
}
```

## 🛡️ Authorization & Roles

| Role        | Description   | Access Level                  |
| ----------- | ------------- | ----------------------------- |
| **USER**    | Regular user  | Own profile only              |
| **ADMIN**   | Administrator | All users + system management |
| **SERVICE** | Inter-service | Read-only user data           |

### Permission Matrix

| Endpoint                 | USER     | ADMIN | SERVICE |
| ------------------------ | -------- | ----- | ------- |
| POST /api/v1/users       | ✅ Public | ✅     | ✅       |
| GET /api/v1/users        | ❌        | ✅     | ✅       |
| GET /api/v1/users/:id    | ✅ Own    | ✅ All | ✅ All   |
| PUT /api/v1/users/:id    | ✅ Own    | ✅ All | ❌       |
| DELETE /api/v1/users/:id | ✅ Own    | ✅ All | ❌       |
| GET /contact-info        | ❌        | ✅     | ✅       |

## 📊 Database Schema

### Users Table

```sql
- id (UUID, PK)
- name (VARCHAR)
- email (VARCHAR, UNIQUE)
- password (VARCHAR, hashed)
- push_token (TEXT, nullable)
- role (ENUM: user, admin, service)
- is_active (BOOLEAN)
- email_verified (BOOLEAN)
- refresh_token (TEXT, nullable)
- last_login (TIMESTAMP)
- created_at, updated_at
```

## 🔐 Security Features

1. **Password Security**: bcrypt hashing, passwords excluded from responses
2. **JWT Security**: access tokens (1 hour), refresh tokens (7 days)
3. **Input Validation**: class-validator decorators, email format validation, required fields
4. **Authorization**: Role-based access control

## 🧪 Testing

```bash
npm run test
npm run test:e2e
npm run test:cov
```

## 🚀 Deployment

* Environment variables for production in `.env`
* Kubernetes-ready health checks