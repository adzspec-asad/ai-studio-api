import Tenant from '#models/tenant_model' // 👈 Import Tenant model
import type { HttpContext } from '@adonisjs/core/http'
import type { NextFn } from '@adonisjs/core/types/http'
import db from '@adonisjs/lucid/services/db'

export default class TenantResolver {
  public async handle({ request }: HttpContext, next: NextFn) {
    // 👇 You can choose to resolve by subdomain or header
    const tenantSlug = request.header('x-tenant') 
      || request.subdomains()[0] // e.g., acme.my-ai-studio.com → "acme"

    if (!tenantSlug) {
      throw new Error('Tenant not specified')
    }

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
}
