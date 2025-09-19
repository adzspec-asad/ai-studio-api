import Tenant from '#models/tenant_model' // 👈 Import Tenant model
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import db from '@adonisjs/lucid/services/db'

export default class TenantResolver {
  /**
   * Routes that should skip tenant resolution
   */
  private skipTenantRoutes = [
    '/health',
    '/health/liveness',
    '/health/readiness',
    '/api/system/auth/*', // System user auth routes
    '/api/system/tenants/*', // Tenant management routes
    '/' // Root route
  ]

  public async handle({ request }: HttpContext, next: NextFn) {
    const url = request.url()
    const pathname = new URL(url, 'http://localhost').pathname

    // Skip tenant resolution for system routes
    if (this.shouldSkipTenantResolution(pathname)) {
      console.log(`🔄 Skipping tenant resolution for system route: ${pathname}`)
      return next()
    }

    console.log(`🏢 Resolving tenant for route: ${pathname}`)

    // 👇 You can choose to resolve by subdomain or header
    const tenantSlug = request.header('x-tenant')
      || request.subdomains()[0] // e.g., acme.my-ai-studio.com → "acme"

    if (!tenantSlug) {
      console.log(`❌ No tenant specified for route: ${pathname}`)
      console.log(`   - x-tenant header: ${request.header('x-tenant') || 'not provided'}`)
      console.log(`   - subdomains: ${JSON.stringify(request.subdomains())}`)
      throw new Error('Tenant not specified. Please provide tenant via x-tenant header or subdomain.')
    }

    console.log(`✅ Resolved tenant: ${tenantSlug} for route: ${pathname}`)

    // 🔎 Look up tenant in master DB
    const tenant = await Tenant.query({ connection: 'master' })
      .where('slug', tenantSlug)
      .firstOrFail()

    // ⚡️ Dynamically register tenant DB connection (overwrite per request)
    const tenantConfig = {
      client: 'pg' as const,
      connection: {
        host: tenant.dbHost,
        port: tenant.dbPort,
        user: tenant.dbUser,
        password: tenant.dbPassword,
        database: tenant.dbName,
      },
    }

    // 🛡 Safeguard: check if connection exists
    const existing = db.manager.get('tenant')

    if (!existing) {
      db.manager.add('tenant', tenantConfig)
    } else {
      // Optional: if you want to switch dynamically per request
      // (rare in white-label setup, since usually one tenant per request lifecycle)
      const existingConfig = existing.config

      const sameDb =
        existingConfig.connection &&
        typeof existingConfig.connection === 'object' &&
        'host' in existingConfig.connection &&
        'database' in existingConfig.connection &&
        existingConfig.connection.host === tenantConfig.connection.host &&
        existingConfig.connection.database === tenantConfig.connection.database

      if (!sameDb) {
        // Replace old connection with the correct tenant DB
        db.manager.close('tenant')
        db.manager.add('tenant', tenantConfig)
      }
    }

    // 🟢 Continue request
    await next()
  }

  /**
   * Check if the current route should skip tenant resolution
   */
  private shouldSkipTenantResolution(pathname: string): boolean {
    return this.skipTenantRoutes.some(route => {
      // Handle wildcard patterns (e.g., /api/system/auth/* matches /api/system/auth/login)
      if (route.endsWith('/*')) {
        const baseRoute = route.slice(0, -2) // Remove '/*'
        return pathname.startsWith(baseRoute)
      }

      // Exact match
      if (pathname === route) {
        return true
      }

      // Legacy prefix match for API routes without wildcards
      if (route.startsWith('/api/') && !route.includes('*') && pathname.startsWith(route)) {
        return true
      }

      return false
    })
  }
}
