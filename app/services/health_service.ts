import db from '@adonisjs/lucid/services/db'
import { HealthCheckResponse } from '../types/health.js'

export default class HealthService {
  public async check(): Promise<HealthCheckResponse> {
    const checks = {
      database: await this.checkDatabase(),
      memory: this.checkMemory(),
      uptime: this.checkUptime(),
    }

    const status = Object.values(checks).every(check => check.status === 'healthy')
      ? 'healthy'
      : 'unhealthy'

    return {
      status,
      timestamp: new Date().toISOString(),
      checks,
    }
  }

  private async checkDatabase(): Promise<{ status: 'healthy' | 'unhealthy' | 'warning'; message?: string }> {
    try {
      await db.rawQuery('SELECT 1')
      return { status: 'healthy' }
    } catch (error) {
      return {
        status: 'unhealthy',
        message: error.message,
      }
    }
  }



  private checkMemory(): { status: string; data: { usage: number; max: number } } {
    const memoryUsage = process.memoryUsage()
    const used = memoryUsage.heapUsed / 1024 / 1024
    const max = memoryUsage.heapTotal / 1024 / 1024

    return {
      status: used / max > 0.9 ? 'warning' : 'healthy',
      data: {
        usage: Math.round(used * 100) / 100,
        max: Math.round(max * 100) / 100,
      },
    }
  }

  private checkUptime(): { status: string; data: { seconds: number } } {
    return {
      status: 'healthy',
      data: {
        seconds: Math.floor(process.uptime()),
      },
    }
  }
}