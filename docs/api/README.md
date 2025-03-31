# API Documentation

## Overview

This documentation provides detailed information about the CompliTracker API endpoints, authentication, and usage guidelines for all microservices.

## Authentication

All API requests require authentication using JWT (JSON Web Tokens).

### Authentication Header
```
Authorization: Bearer <jwt_token>
```

## API Gateway Endpoints

### Base URL
```
https://api.complitracker.com/v1
```

## Service APIs

### Authentication Service

#### Login
- **POST** `/auth/login`
  ```json
  {
    "email": "string",
    "password": "string"
  }
  ```
  Response:
  ```json
  {
    "token": "string",
    "refreshToken": "string",
    "expiresIn": "number"
  }
  ```

#### Refresh Token
- **POST** `/auth/refresh`
  ```json
  {
    "refreshToken": "string"
  }
  ```

### Core Service

#### Get Compliance Tasks
- **GET** `/tasks`
  - Query Parameters:
    - status (optional)
    - priority (optional)
    - page (optional)
    - size (optional)

#### Create Compliance Task
- **POST** `/tasks`
  ```json
  {
    "title": "string",
    "description": "string",
    "dueDate": "string",
    "priority": "string",
    "assignee": "string"
  }
  ```

### Document Service

#### Upload Document
- **POST** `/documents/upload`
  - Multipart form data
  - Parameters:
    - file: File
    - metadata: JSON string

#### Get Document
- **GET** `/documents/{id}`

### Notification Service

#### Get Notifications
- **GET** `/notifications`
  - Query Parameters:
    - read (optional)
    - type (optional)

#### Update Notification Preferences
- **PUT** `/notifications/preferences`
  ```json
  {
    "email": "boolean",
    "push": "boolean",
    "sms": "boolean"
  }
  ```

### Email Service

#### Send Email
- **POST** `/email/send`
  ```json
  {
    "to": "string",
    "subject": "string",
    "template": "string",
    "data": "object"
  }
  ```

## Error Handling

All API errors follow a standard format:

```json
{
  "error": {
    "code": "string",
    "message": "string",
    "details": "object"
  }
}
```

### Common Error Codes
- 400: Bad Request
- 401: Unauthorized
- 403: Forbidden
- 404: Not Found
- 429: Too Many Requests
- 500: Internal Server Error

## Rate Limiting

API requests are limited to:
- 100 requests per minute for authenticated users
- 20 requests per minute for unauthenticated users

## Versioning

API versioning is handled through the URL path. The current version is v1.

## Testing

A sandbox environment is available for testing:
```
https://sandbox-api.complitracker.com/v1
```

## Support

For API support and issues:
- Email: api-support@complitracker.com
- Documentation Issues: Create a GitHub issue