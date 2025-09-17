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
router.get('/', async () => {
  return {
    hello: 'world',
  }
})


// Health check routes
router.get('/health', [HealthController, 'check'])
router.get('/health/liveness', [HealthController, 'liveness'])
router.get('/health/readiness', [HealthController, 'readiness'])