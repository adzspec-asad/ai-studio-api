import type { HttpContext } from '@adonisjs/core/http'
import HealthService from '#services/health_service'

export default class HealthController {
  private healthService = new HealthService()

  public async check({ response }: HttpContext) {
    const health = await this.healthService.check()

    return response.status(health.status === 'healthy' ? 200 : 503).json(health)
  }

  public async liveness({ response }: HttpContext) {
    // Simple liveness probe - just check if app is responding
    return response.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
    })
  }

  public async readiness({ response }: HttpContext) {
    // Readiness probe - check dependencies
    const health = await this.healthService.check()
    
    return response.status(health.status === 'healthy' ? 200 : 503).json({
      status: health.status,
      timestamp: health.timestamp,
    })
  }
}