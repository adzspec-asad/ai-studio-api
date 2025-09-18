# System User Authentication

This document describes the authentication system for system users (superadmin, admin, support) in the AI Studio API.

## Overview

The system uses access tokens for authentication, which are suitable for API-based authentication. The authentication is handled by the `SystemUserAuthController` and uses the `system-user` guard configured in `config/auth.ts`.

## API Endpoints

### Public Endpoints (No Authentication Required)

#### POST `/api/system/auth/login`
Login a system user and receive an access token.

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "data": {
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin"
    },
    "token": {
      "type": "bearer",
      "value": "oat_MTA.aWFQUmo2WkQzd3M5cW0zeG5JeHdiaV9rOFQzUWM1aTZSR2xJaDZXYzM5MDE4MzA3NTU",
      "expiresAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

### Protected Endpoints (Authentication Required)

All protected endpoints require the `Authorization` header with the bearer token:
```
Authorization: Bearer oat_MTA.aWFQUmo2WkQzd3M5cW0zeG5JeHdiaV9rOFQzUWM1aTZSR2xJaDZXYzM5MDE4MzA3NTU
```

#### POST `/api/system/auth/register`
Create a new system user (only superadmin can create new users).

**Request Body:**
```json
{
  "name": "New Admin",
  "email": "newadmin@example.com",
  "password": "password123",
  "password_confirmation": "password123",
  "role": "admin"
}
```

#### GET `/api/system/auth/profile`
Get the current authenticated user's profile.

**Response:**
```json
{
  "message": "Profile retrieved successfully",
  "data": {
    "user": {
      "id": "1",
      "email": "admin@example.com",
      "name": "Admin User",
      "role": "admin",
      "createdAt": "2024-01-01T00:00:00.000Z",
      "updatedAt": "2024-01-01T00:00:00.000Z"
    },
    "token": {
      "name": "System User Login Token",
      "abilities": ["*"],
      "lastUsedAt": "2024-01-14T10:30:00.000Z",
      "expiresAt": "2024-01-15T10:30:00.000Z"
    }
  }
}
```

#### POST `/api/system/auth/logout`
Logout the current user (invalidate the current token).

#### GET `/api/system/auth/tokens`
List all access tokens for the current user.

#### POST `/api/system/auth/tokens`
Create a new access token for the current user.

**Request Body:**
```json
{
  "name": "API Token",
  "abilities": ["*"],
  "expiresIn": "30 days"
}
```

#### DELETE `/api/system/auth/tokens/:tokenId`
Delete a specific access token.

## User Roles

- **superadmin**: Can create other system users, has full access
- **admin**: Can manage tenants and their data
- **support**: Can view and assist with tenant issues

## Authentication Flow

1. **Login**: Send credentials to `/api/system/auth/login`
2. **Receive Token**: Get the access token from the response
3. **Use Token**: Include the token in the `Authorization` header for all subsequent requests
4. **Token Management**: Create additional tokens or revoke existing ones as needed
5. **Logout**: Call `/api/system/auth/logout` to invalidate the current token

## Example Usage

### Login
```bash
curl -X POST http://localhost:3333/api/system/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "password123"
  }'
```

### Access Protected Route
```bash
curl -X GET http://localhost:3333/api/system/auth/profile \
  -H "Authorization: Bearer oat_MTA.aWFQUmo2WkQzd3M5cW0zeG5JeHdiaV9rOFQzUWM1aTZSR2xJaDZXYzM5MDE4MzA3NTU"
```

## Security Features

- **Password Hashing**: Passwords are hashed using scrypt
- **Token Security**: Access tokens are cryptographically secure with CRC32 checksums
- **Token Expiration**: Tokens can have expiration dates
- **Token Abilities**: Tokens can be limited to specific abilities
- **Secure Storage**: Only token hashes are stored in the database

## Database Tables

- `system_users`: Stores system user information
- `auth_access_tokens`: Stores access token hashes and metadata
