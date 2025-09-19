/*
|--------------------------------------------------------------------------
| Routes file
|--------------------------------------------------------------------------
|
| The routes file is used for defining the HTTP routes.
|
*/

import router from '@adonisjs/core/services/router'
import HealthController from '#controllers/http/api/health_controller'
import SystemUserAuthController from '#controllers/http/api/system_user_auth_controller'
import TenantController from '#controllers/http/api/tenant_controller'
import { middleware } from '#start/kernel'
router.get('/', async () => {
  return {
    hello: 'world',
  }
})


// Health check routes
router.get('/health', [HealthController, 'check'])
router.get('/health/liveness', [HealthController, 'liveness'])
router.get('/health/readiness', [HealthController, 'readiness'])

// System User Authentication routes
router.group(() => {
  // Public routes (no authentication required)
  router.post('/login', [SystemUserAuthController, 'login'])

  // Protected routes (authentication required)
  router.group(() => {
    router.post('/register', [SystemUserAuthController, 'register'])
    router.get('/profile', [SystemUserAuthController, 'profile'])
    router.post('/logout', [SystemUserAuthController, 'logout'])
    router.get('/tokens', [SystemUserAuthController, 'tokens'])
    router.post('/tokens', [SystemUserAuthController, 'createToken'])
    router.delete('/tokens/:tokenId', [SystemUserAuthController, 'deleteToken'])
  }).use(middleware.auth({ guards: ['system_user'] }))
}).prefix('/api/system/auth')

// Tenant Management routes (protected - requires authentication)
router.group(() => {
  router.get('/tenants', [TenantController, 'index'])
  router.post('/tenants', [TenantController, 'create'])
  router.get('/tenants/:slug', [TenantController, 'show'])
  router.put('/tenants/:slug', [TenantController, 'update'])
  router.delete('/tenants/:slug', [TenantController, 'destroy'])
}).prefix('/api/system').use(middleware.auth({ guards: ['system_user'] }))