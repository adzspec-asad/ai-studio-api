# Tenant Onboarding Service

This document describes how to use the enhanced Tenant Onboarding Service that automatically creates database users and databases for each new tenant.

## Overview

The `TenantOnboardingService` has been enhanced to handle complete tenant provisioning including:

1. **Automatic credential generation** - Creates unique database names, usernames, and secure passwords
2. **Database user creation** - Creates a dedicated PostgreSQL user for each tenant
3. **Database creation** - Creates a separate database owned by the tenant's user
4. **Migration execution** - Runs tenant-specific migrations on the new database
5. **Metadata storage** - Saves tenant information in the master database

## Key Features

### Automatic Database User Management

- **Unique Users**: Each tenant gets a dedicated database user (e.g., `user_acme_corp`)
- **Secure Passwords**: Auto-generated 16-character passwords with special characters
- **Proper Permissions**: Users get `CREATEDB` permission and ownership of their database
- **Error Handling**: Gracefully handles existing users by updating passwords

### Database Isolation

- **Separate Databases**: Each tenant gets their own PostgreSQL database
- **Owned Resources**: Tenant users own their databases for full control
- **UTF-8 Encoding**: All databases created with UTF-8 encoding by default

## API Usage

### Creating a New Tenant

**Endpoint**: `POST /api/system/tenants`

**Authentication**: Requires system user authentication with `superadmin` role

**Request Body** (minimal):
```json
{
  "name": "Acme Corporation",
  "slug": "acme-corp"
}
```

**Request Body** (with custom database settings):
```json
{
  "name": "Acme Corporation",
  "slug": "acme-corp",
  "dbHost": "localhost",
  "dbPort": 5432,
  "dbName": "acme_corp_db",
  "dbUser": "acme_user",
  "dbPassword": "secure_password_123"
}
```

**Response**:
```json
{
  "message": "Tenant created successfully",
  "data": {
    "tenant": {
      "id": "uuid-here",
      "name": "Acme Corporation",
      "slug": "acme-corp",
      "dbHost": "localhost",
      "dbPort": 5432,
      "dbName": "tenant_acme_corp",
      "dbUser": "user_acme_corp",
      "status": "active"
    }
  }
}
```

### Other Tenant Operations

- **List Tenants**: `GET /api/system/tenants`
- **Get Tenant**: `GET /api/system/tenants/:slug`
- **Update Tenant**: `PUT /api/system/tenants/:slug`
- **Delete Tenant**: `DELETE /api/system/tenants/:slug` (⚠️ Destructive - removes database!)

## Programmatic Usage

```typescript
import TenantOnboardingService from '#services/tenant_onboarding_service'

// Create a new tenant with minimal input
const tenant = await TenantOnboardingService.provisionTenant({
  name: 'My New Tenant',
  slug: 'my-tenant'
})

// The service will automatically:
// - Generate dbName: 'tenant_my_tenant'
// - Generate dbUser: 'user_my_tenant'  
// - Generate secure dbPassword
// - Create the database user
// - Create the database
// - Run migrations
// - Save to master DB

console.log(`Tenant created: ${tenant.name}`)
console.log(`Database: ${tenant.dbName}`)
console.log(`User: ${tenant.dbUser}`)
```

## Credential Generation Logic

When not provided, the service generates:

- **Database Name**: `tenant_{slug}` (sanitized)
- **Database User**: `user_{slug}` (sanitized)
- **Password**: 16-character random string with letters, numbers, and symbols
- **Host/Port**: Uses master database host/port by default

## Security Considerations

1. **Password Storage**: Database passwords are stored in the master database (consider encryption)
2. **User Permissions**: Tenant users only have access to their own databases
3. **Network Access**: Ensure proper firewall rules for database access
4. **Backup Strategy**: Each tenant database should be backed up separately

## Error Handling

The service handles common scenarios:

- **Existing Users**: Updates password instead of failing
- **Existing Databases**: Logs warning but continues (useful for development)
- **Migration Failures**: Throws error and stops provisioning
- **Permission Issues**: Provides clear error messages

## Development and Testing

### Cleanup Method

For development/testing, use the cleanup method:

```typescript
// Remove a tenant and all associated resources
await TenantOnboardingService.removeTenant('test-tenant')
```

This will:
- Drop the tenant database
- Drop the database user
- Remove the tenant record from master DB

## Prerequisites

1. **Master Database**: Must have a PostgreSQL master database configured
2. **Permissions**: Master database user needs `CREATEDB` and `CREATEROLE` permissions
3. **Migrations**: Tenant migration files should be in `database/migrations/tenant/`
4. **Dependencies**: Requires `execa` package for running migrations

## Configuration

The service uses environment variables from the master database configuration:

- `MASTER_DB_HOST`: Default host for tenant databases
- `MASTER_DB_PORT`: Default port for tenant databases
- `MASTER_DB_DATABASE`: Master database name (for permission grants)

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure master DB user has `CREATEDB` and `CREATEROLE` permissions
2. **Migration Failures**: Check that tenant migration files exist and are valid
3. **Connection Issues**: Verify database host/port accessibility
4. **Duplicate Slugs**: Ensure tenant slugs are unique across the system

### Logs

The service provides detailed console logging:
- ✅ Success messages for each step
- ⚠️ Warning messages for non-critical issues  
- ❌ Error messages with details

Check your application logs for detailed information about the provisioning process.
