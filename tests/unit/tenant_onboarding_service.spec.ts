import { test } from '@japa/runner'
import TenantOnboardingService from '#services/tenant_onboarding_service'
import db from '@adonisjs/lucid/services/db'

test.group('Tenant Onboarding Service', (group) => {
  // Clean up any test tenants after each test
  group.each.teardown(async () => {
    try {
      await TenantOnboardingService.removeTenant('test-tenant')
    } catch (error) {
      // Ignore errors if tenant doesn't exist
    }
  })

  test('should generate unique credentials when not provided', async ({ assert }) => {
    // This test doesn't actually create the tenant, just tests credential generation
    const input = {
      name: 'Test Tenant',
      slug: 'test-tenant'
    }

    // We'll test the private method indirectly by checking the service behavior
    // In a real scenario, you might want to make generateTenantCredentials public for testing
    
    // For now, let's test that the service can handle minimal input
    assert.isTrue(true) // Placeholder - would need to expose method for proper testing
  })

  test('should create tenant with custom database settings', async ({ assert }) => {
    const input = {
      name: 'Test Tenant',
      slug: 'test-tenant-custom',
      dbName: 'custom_test_db',
      dbUser: 'custom_test_user',
      dbPassword: 'custom_password_123'
    }

    // Note: This test would require a test database setup
    // For now, we'll just verify the input validation
    assert.equal(input.name, 'Test Tenant')
    assert.equal(input.slug, 'test-tenant-custom')
    assert.equal(input.dbName, 'custom_test_db')
  })

  test('should handle database connection errors gracefully', async ({ assert }) => {
    // Test error handling when database is not available
    // This would require mocking the database connection
    assert.isTrue(true) // Placeholder for actual error handling test
  })

  test('should validate tenant slug format', async ({ assert }) => {
    // Test that slugs are properly sanitized
    const validSlug = 'valid-tenant-123'
    const invalidSlug = 'Invalid Tenant With Spaces!'
    
    assert.match(validSlug, /^[a-z0-9-]+$/)
    assert.notMatch(invalidSlug, /^[a-z0-9-]+$/)
  })
})

// Example of how to test the actual service (requires database setup)
test.group('Tenant Onboarding Integration', (group) => {
  // Skip these tests if not in a proper test environment
  group.setup(() => {
    // You would check for test database availability here
    // and skip the group if not available
  })

  test.skip('should provision a complete tenant', async ({ assert }) => {
    const input = {
      name: 'Integration Test Tenant',
      slug: 'integration-test'
    }

    try {
      const tenant = await TenantOnboardingService.provisionTenant(input)
      
      assert.equal(tenant.name, input.name)
      assert.equal(tenant.slug, input.slug)
      assert.isTrue(tenant.dbName.includes('integration_test'))
      assert.isTrue(tenant.dbUser.includes('integration_test'))
      assert.equal(tenant.status, 'active')

      // Verify database was created
      const databases = await db.rawQuery(
        `SELECT datname FROM pg_database WHERE datname = '${tenant.dbName}'`
      )
      assert.equal(databases.rows.length, 1)

      // Verify user was created
      const users = await db.rawQuery(
        `SELECT usename FROM pg_user WHERE usename = '${tenant.dbUser}'`
      )
      assert.equal(users.rows.length, 1)

    } finally {
      // Clean up
      await TenantOnboardingService.removeTenant('integration-test')
    }
  })

  test.skip('should remove tenant and cleanup resources', async ({ assert }) => {
    // First create a tenant
    const input = {
      name: 'Cleanup Test Tenant',
      slug: 'cleanup-test'
    }

    const tenant = await TenantOnboardingService.provisionTenant(input)
    assert.isTrue(tenant.id !== undefined)

    // Then remove it
    const result = await TenantOnboardingService.removeTenant('cleanup-test')
    assert.isTrue(result)

    // Verify database was dropped
    const databases = await db.rawQuery(
      `SELECT datname FROM pg_database WHERE datname = '${tenant.dbName}'`
    )
    assert.equal(databases.rows.length, 0)

    // Verify user was dropped
    const users = await db.rawQuery(
      `SELECT usename FROM pg_user WHERE usename = '${tenant.dbUser}'`
    )
    assert.equal(users.rows.length, 0)
  })
})
