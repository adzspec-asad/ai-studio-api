export interface HealthCheckResponse {
  status: 'healthy' | 'unhealthy'
  timestamp: string
  checks: {
    database: HealthCheck
    memory: HealthCheckWithData<{ usage: number; max: number }>
    uptime: HealthCheckWithData<{ seconds: number }>
  }
}

export interface HealthCheck {
  status: 'healthy' | 'unhealthy' | 'warning'
  message?: string
}

export interface HealthCheckWithData<T> extends HealthCheck {
  data?: T
}