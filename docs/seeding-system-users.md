# System User Seeding

This document explains how to seed system users (superadmin, admin, support) into the database.

## Overview

We have created three seeders for system users:

1. **`system_user_seeder.ts`** - Development seeder with hardcoded test users
2. **`production_system_user_seeder.ts`** - Production seeder using environment variables
3. **`factory_system_user_seeder.ts`** - Factory-based seeder for testing with realistic fake data

## Quick Reference

| Seeder | Use Case | Users Created | Credentials |
|--------|----------|---------------|-------------|
| `system_user_seeder.ts` | Development | 3 fixed users | Hardcoded |
| `production_system_user_seeder.ts` | Production | 1 superadmin | Environment vars |
| `factory_system_user_seeder.ts` | Testing | 8+ random users | `Password123!` |

## Development Seeding

For development and testing, use the basic seeder that creates multiple test users:

```bash
node ace db:seed --files="database/seeders/system_user_seeder.ts"
```

This creates:
- **Superadmin**: `superadmin@ai-studio.com` / `SuperAdmin123!`
- **Admin**: `admin@ai-studio.com` / `Admin123!`
- **Support**: `support@ai-studio.com` / `Support123!`

## Production Seeding

For production environments, use the environment-based seeder:

```bash
node ace db:seed --files="database/seeders/production_system_user_seeder.ts"
```

### Environment Variables

Set these environment variables before running the production seeder:

```env
SUPERADMIN_EMAIL=your-superadmin@company.com
SUPERADMIN_PASSWORD=YourSecurePassword123!
SUPERADMIN_NAME=Your Name
```

If not set, defaults will be used:
- Email: `superadmin@ai-studio.com`
- Password: `SuperAdmin123!`
- Name: `Super Administrator`

## Factory-Based Seeding

For testing environments where you need multiple users with realistic fake data:

```bash
node ace db:seed --files="database/seeders/factory_system_user_seeder.ts"
```

This creates:
- **1 Superadmin** with realistic fake data
- **3 Admin users** with fake names and emails
- **4 Support users** with fake names and emails
- All users have the password: `Password123!`

## Running All Seeders

To run all seeders (including system users):

```bash
node ace db:seed
```

## Migration and Seeding Together

To run migrations and seeders in one command:

```bash
# Fresh database with seeders
node ace migration:fresh --seed

# Or run migrations first, then seed
node ace migration:run
node ace db:seed
```

## Seeder Features

### Safety Checks
- Both seeders check for existing users before creating new ones
- Won't create duplicate superadmin users
- Provides clear console output about what was created or skipped

### Security Features
- Passwords are automatically hashed using the model's `hashPassword` method
- Production seeder uses environment variables for sensitive data
- Includes security reminders in console output

### Console Output
The seeders provide detailed feedback:

```
✅ Superadmin created successfully:
   Email: superadmin@ai-studio.com
   Name: Super Administrator
   Role: superadmin
   ID: 1
   Created At: 2024-01-14T10:30:00.000Z

🔐 SECURITY REMINDER:
   - Change the default password immediately after first login
   - Use strong, unique passwords for production
   - Consider enabling 2FA if available
   - Regularly rotate access tokens
```

## First Login

After seeding, you can login using the created credentials:

```bash
curl -X POST http://localhost:3333/api/system/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "superadmin@ai-studio.com",
    "password": "SuperAdmin123!"
  }'
```

## Security Best Practices

1. **Change Default Passwords**: Immediately change default passwords after first login
2. **Use Strong Passwords**: Use complex passwords with mixed case, numbers, and symbols
3. **Environment Variables**: Always use environment variables in production
4. **Regular Rotation**: Regularly rotate passwords and access tokens
5. **Principle of Least Privilege**: Only create users with the minimum required role

## Troubleshooting

### Common Issues

1. **"User already exists"**: The seeder skips existing users - this is normal
2. **Database connection error**: Ensure your database is running and connection details are correct
3. **Migration not run**: Run `node ace migration:run` before seeding

### Checking Created Users

You can verify created users by querying the database:

```sql
SELECT id, name, email, role, created_at FROM system_users;
```

Or use the API to login and check the profile endpoint.

## Development vs Production

| Feature | Development Seeder | Production Seeder |
|---------|-------------------|-------------------|
| Multiple users | ✅ (3 users) | ❌ (1 superadmin only) |
| Hardcoded credentials | ✅ | ❌ |
| Environment variables | ❌ | ✅ |
| Security warnings | ❌ | ✅ |
| Fixed IDs | ✅ | ❌ |

Choose the appropriate seeder based on your environment and security requirements.
