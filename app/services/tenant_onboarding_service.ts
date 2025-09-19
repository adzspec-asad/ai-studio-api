import { execa } from 'execa' // lightweight lib to run shell commands
import db from '@adonisjs/lucid/services/db'
import Tenant from '#models/tenant_model'
import { randomUUID } from 'node:crypto'
import TenantInput from '../types/tenant_input.js'
import env from '#start/env'

export default class TenantOnboardingService {
  /**
   * Provision a new tenant:
   * 1. Generate unique database credentials
   * 2. Create the database user
   * 3. Create the tenant database
   * 4. Run tenant migrations
   * 5. Save tenant metadata in master DB
   */
  public static async provisionTenant(input: TenantInput) {
    // 1️⃣ Generate unique database credentials if not provided
    const tenantCredentials = this.generateTenantCredentials(input)

    // 2️⃣ Create database user
    await this.createDatabaseUser(tenantCredentials)

    // 3️⃣ Create tenant database
    await this.createDatabase(tenantCredentials)

    // 4️⃣ Run tenant migrations
    await this.runMigrations(tenantCredentials)

    // 5️⃣ Insert into master DB
    const tenant = await Tenant.create({
      id: randomUUID(),
      name: tenantCredentials.name,
      slug: tenantCredentials.slug,
      dbHost: tenantCredentials.dbHost,
      dbPort: tenantCredentials.dbPort,
      dbUser: tenantCredentials.dbUser,
      dbPassword: tenantCredentials.dbPassword,
      dbName: tenantCredentials.dbName,
      status: 'active',
    })

    return tenant
  }

  /**
   * Generate unique database credentials for a tenant
   */
  private static generateTenantCredentials(input: TenantInput): Required<TenantInput> {
    const slug = input.slug || `tenant_${Date.now()}`
    const dbName = input.dbName || `tenant_${slug.replace(/[^a-zA-Z0-9]/g, '_')}`
    const dbUser = input.dbUser || `user_${slug.replace(/[^a-zA-Z0-9]/g, '_')}`
    const dbPassword = input.dbPassword || this.generateSecurePassword()

    return {
      id: input.id || randomUUID(),
      name: input.name || slug,
      slug,
      dbHost: input.dbHost || env.get('MASTER_DB_HOST', '127.0.0.1'),
      dbPort: input.dbPort || Number(env.get('MASTER_DB_PORT', 5432)),
      dbUser,
      dbPassword,
      dbName,
      status: input.status || 'active'
    }
  }

  /**
   * Generate a secure random password
   */
  private static generateSecurePassword(): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*'
    let password = ''
    for (let i = 0; i < 16; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length))
    }
    return password
  }

  /**
   * Create a new database user with appropriate permissions
   */
  private static async createDatabaseUser(input: Required<TenantInput>) {
    const { dbUser, dbPassword } = input

    try {
      // Create the user if it doesn't exist
      await db.rawQuery(
        `CREATE USER "${dbUser}" WITH PASSWORD '${dbPassword}'`
      )

      // Grant necessary permissions
      await db.rawQuery(
        `GRANT CONNECT ON DATABASE "${env.get('MASTER_DB_DATABASE', 'ai-studio-master')}" TO "${dbUser}"`
      )

      // Grant create database permission so the user can own their database
      await db.rawQuery(
        `ALTER USER "${dbUser}" CREATEDB`
      )

      console.log(`✅ Database user '${dbUser}' created successfully`)
    } catch (error: any) {
      // If user already exists, that's okay - just update the password
      if (error.message?.includes('already exists')) {
        await db.rawQuery(
          `ALTER USER "${dbUser}" WITH PASSWORD '${dbPassword}'`
        )
        console.log(`✅ Database user '${dbUser}' password updated`)
      } else {
        throw error
      }
    }
  }

  /**
   * Create the tenant database
   */
  private static async createDatabase(input: Required<TenantInput>) {
    const { dbName, dbUser } = input

    try {
      // Use master DB connection to issue CREATE DATABASE
      await db.rawQuery(
        `CREATE DATABASE "${dbName}" WITH OWNER = "${dbUser}" ENCODING = 'UTF8'`
      )

      console.log(`✅ Database '${dbName}' created successfully`)
    } catch (error: any) {
      // If database already exists, that's okay for development
      if (!error.message?.includes('already exists')) {
        throw error
      }
      console.log(`⚠️ Database '${dbName}' already exists`)
    }
  }

  /**
   * Run migrations on the tenant database
   */
  private static async runMigrations(input: Required<TenantInput>) {
    const connectionUrl = `postgresql://${input.dbUser}:${input.dbPassword}@${input.dbHost}:${input.dbPort}/${input.dbName}`

    try {
      // Run migrations against tenant DB
      await execa('node', [
        'ace',
        'migration:run',
        '--connection=tenant',
        `--connection-url=${connectionUrl}`,
        '--folder=tenant',
      ], {
        stdio: 'inherit',
      })

      console.log(`✅ Migrations completed for tenant database '${input.dbName}'`)
    } catch (error) {
      console.error(`❌ Failed to run migrations for tenant database '${input.dbName}':`, error)
      throw error
    }
  }

  /**
   * Cleanup method to remove a tenant and its database (for development/testing)
   */
  public static async removeTenant(slug: string) {
    try {
      // Find the tenant
      const tenant = await Tenant.findByOrFail('slug', slug)

      // Drop the database
      await db.rawQuery(`DROP DATABASE IF EXISTS "${tenant.dbName}"`)

      // Drop the user
      await db.rawQuery(`DROP USER IF EXISTS "${tenant.dbUser}"`)

      // Remove from master DB
      await tenant.delete()

      console.log(`✅ Tenant '${slug}' and associated database removed successfully`)
      return true
    } catch (error) {
      console.error(`❌ Failed to remove tenant '${slug}':`, error)
      throw error
    }
  }
}