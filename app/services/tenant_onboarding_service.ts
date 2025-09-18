import { execa } from 'execa' // lightweight lib to run shell commands
import db from '@adonisjs/lucid/services/db'
import Tenant from '#models/tenant_model'
import { randomUUID } from 'node:crypto'
import TenantInput from '../types/tenant_input.js'

export default class TenantOnboardingService {
  /**
   * Provision a new tenant:
   * 1. Create the tenant database
   * 2. Run tenant migrations
   * 3. Save tenant metadata in master DB
   */
  public static async provisionTenant(input: TenantInput) {
    // 1️⃣ Create tenant database
    await this.createDatabase(input)

    // 2️⃣ Run tenant migrations
    await this.runMigrations(input)

    // 3️⃣ Insert into master DB
    const tenant = await Tenant.create({
      id: randomUUID(),
      name: input.name,
      slug: input.slug,
      dbHost: input.dbHost,
      dbPort: input.dbPort,
      dbUser: input.dbUser,
      dbPassword: input.dbPassword,
      dbName: input.dbName,
      status: 'active',
    })

    return tenant
  }

  private static async createDatabase(input: TenantInput) {
    const { dbName, dbUser, dbPassword, dbHost, dbPort } = input

    // Use master DB connection to issue CREATE DATABASE
    await db.rawQuery(
      `CREATE DATABASE "${dbName}" WITH OWNER = "${dbUser}"`
    )

    // ⚠️ Make sure dbUser exists and has rights (you may need CREATE DATABASE role)
    // Alternatively, handle dbUser creation here
  }

  private static async runMigrations(input: TenantInput) {
    const connectionUrl = `postgresql://${input.dbUser}:${input.dbPassword}@${input.dbHost}:${input.dbPort}/${input.dbName}`

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
  }
}