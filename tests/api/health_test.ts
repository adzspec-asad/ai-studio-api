import { test } from '@japa/runner'

test.group('API - Health', () => {
  test('health check returns 200', async ({ client }) => {
    const response = await client.get('/health')
    response.assertStatus(200)
    response.assertBodyContains({
      status: 'healthy',
      timestamp: String,
    })
  })

  test('liveness probe returns 200', async ({ client }) => {
    const response = await client.get('/health/live')
    response.assertStatus(200)
    response.assertBodyContains({ status: 'healthy' })
  })

  test('readiness probe returns 200', async ({ client }) => {
    const response = await client.get('/health/ready')
    response.assertStatus(200)
    response.assertBodyContains({ status: 'healthy' })
  })
})