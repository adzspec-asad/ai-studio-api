# Tenant Resolver Middleware

This document explains how the tenant resolver middleware works and how to configure it properly.

## Problem

The tenant resolver middleware was causing "Tenant not specified" errors on system endpoints like `/health` because it was applied globally to all requests.

## Solution

The middleware has been updated to intelligently skip tenant resolution for system routes while still applying it to tenant-specific routes.

## How It Works

### Smart Route Detection

The middleware now includes a list of routes that should skip tenant resolution:

```typescript
private skipTenantRoutes = [
  '/health',
  '/health/liveness', 
  '/health/readiness',
  '/api/system/auth',
  '/api/system/tenants',
  '/' // Root route
]
```

### Route Matching Logic

The middleware uses two types of matching:

1. **Exact Match**: For routes like `/health`
2. **Prefix Match**: For API routes like `/api/system/auth/*`

### Logging

The middleware now includes helpful logging to debug tenant resolution:

```
🔄 Skipping tenant resolution for system route: /health
🏢 Resolving tenant for route: /api/tenant-specific-endpoint
✅ Resolved tenant: acme-corp for route: /api/tenant-specific-endpoint
❌ No tenant specified for route: /api/tenant-specific-endpoint
```

## Configuration Options

### Option 1: Global Middleware (Current Setup)

The tenant resolver runs on all requests but intelligently skips system routes:

```typescript
// start/kernel.ts
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  () => import('#middleware/tenant_resolver'), // Applied globally
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])
```

**Pros:**
- Automatic tenant resolution for all tenant-specific routes
- No need to manually apply middleware to each route group

**Cons:**
- Runs on every request (even if skipped)
- Need to maintain skip list

### Option 2: Named Middleware (Alternative)

Apply tenant resolution only to specific route groups:

```typescript
// start/kernel.ts - Remove from global middleware
server.use([
  () => import('#middleware/container_bindings_middleware'),
  () => import('@adonisjs/auth/initialize_auth_middleware'),
  // () => import('#middleware/tenant_resolver'), // Removed from global
  () => import('#middleware/force_json_response_middleware'),
  () => import('@adonisjs/cors/cors_middleware'),
])

// Add to named middleware
export const middleware = router.named({
  auth: () => import('#middleware/auth_middleware'),
  tenant: () => import('#middleware/tenant_resolver'), // Available as named middleware
})
```

Then apply it to specific routes:

```typescript
// start/routes.ts
// Tenant-specific API routes
router.group(() => {
  router.get('/dashboard', [DashboardController, 'index'])
  router.get('/users', [UserController, 'index'])
  // ... other tenant-specific routes
}).prefix('/api/tenant').use(middleware.tenant()) // Apply tenant resolution

// System routes (no tenant middleware)
router.group(() => {
  router.get('/health', [HealthController, 'check'])
  router.post('/login', [AuthController, 'login'])
}).prefix('/api/system') // No tenant middleware
```

**Pros:**
- More explicit control over which routes need tenant resolution
- Better performance (only runs when needed)
- Clearer separation between system and tenant routes

**Cons:**
- Need to manually apply to each tenant-specific route group
- Risk of forgetting to apply middleware to new tenant routes

## Tenant Resolution Methods

The middleware supports multiple ways to specify the tenant:

### 1. HTTP Header (Recommended for APIs)

```bash
curl -H "x-tenant: acme-corp" http://localhost:3333/api/tenant/dashboard
```

### 2. Subdomain (Recommended for Web Apps)

```
http://acme-corp.yourdomain.com/api/tenant/dashboard
```

The middleware will extract "acme-corp" from the subdomain.

## Testing

### Test System Endpoints (Should Work Without Tenant)

```bash
curl http://localhost:3333/health
curl http://localhost:3333/health/liveness
curl http://localhost:3333/health/readiness
curl http://localhost:3333/api/system/auth/login
```

### Test Tenant Endpoints (Require Tenant)

```bash
# With header
curl -H "x-tenant: acme-corp" http://localhost:3333/api/tenant/dashboard

# With subdomain (if configured)
curl http://acme-corp.localhost:3333/api/tenant/dashboard
```

## Error Handling

When tenant is not specified for routes that require it:

```json
{
  "error": "Tenant not specified. Please provide tenant via x-tenant header or subdomain."
}
```

## Debugging

Enable logging to see tenant resolution in action:

```typescript
// The middleware includes console.log statements for debugging
// Check your application logs to see:
// - Which routes are being processed
// - Whether tenant resolution is skipped or applied
// - What tenant slug is resolved
```

## Recommendations

1. **For Development**: Use the current global middleware approach with smart skipping
2. **For Production**: Consider using named middleware for better performance and explicit control
3. **For APIs**: Use the `x-tenant` header approach
4. **For Web Apps**: Use subdomain-based tenant resolution
5. **Always Test**: Verify that system endpoints work without tenant specification

## Migration Guide

If you want to switch from global to named middleware:

1. Remove tenant resolver from global middleware in `start/kernel.ts`
2. Add it to named middleware exports
3. Apply `middleware.tenant()` to all tenant-specific route groups
4. Test all endpoints to ensure proper functionality
