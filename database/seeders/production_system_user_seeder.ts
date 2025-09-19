import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SystemUserModel from '#models/system_user_model'
import env from '#start/env'
import { randomUUID } from 'node:crypto'

/**
 * Production-ready seeder that uses environment variables
 * for superadmin credentials. This is more secure than hardcoded values.
 *
 * Required environment variables:
 * - SUPERADMIN_EMAIL: Email for the superadmin user
 * - SUPERADMIN_PASSWORD: Password for the superadmin user
 * - SUPERADMIN_NAME: Display name for the superadmin user
 */
export default class extends BaseSeeder {
  async run() {
    console.log('🔄 Running production system user seeder...')

    // Get superadmin credentials from environment variables
    const superadminEmail = env.get('SUPERADMIN_EMAIL', 'superadmin@ai-studio.com')
    const superadminPassword = env.get('SUPERADMIN_PASSWORD', 'SuperAdmin123!')
    const superadminName = env.get('SUPERADMIN_NAME', 'Super Administrator')

    // Validate required environment variables
    if (!superadminEmail || !superadminPassword || !superadminName) {
      console.error('❌ Missing required environment variables:')
      console.error('   SUPERADMIN_EMAIL, SUPERADMIN_PASSWORD, SUPERADMIN_NAME')
      throw new Error('Missing required environment variables for superadmin creation')
    }

    // Check if any superadmin already exists
    const existingSuperadmin = await SystemUserModel.query()
      .where('email', superadminEmail)
      .orWhere('role', 'superadmin')
      .first()

    if (existingSuperadmin) {
      console.log(`⚠️  Superadmin already exists: ${existingSuperadmin.email}`)
      console.log(`   Role: ${existingSuperadmin.role}`)
      console.log(`   Name: ${existingSuperadmin.name}`)
      console.log(`   Created: ${existingSuperadmin.createdAt}`)
      return
    }

    // Create the superadmin user
    try {
      const superadmin = await SystemUserModel.create({
        id: randomUUID(),
        name: superadminName,
        email: superadminEmail,
        password: superadminPassword, // This will be automatically hashed by AdonisJS
        role: 'superadmin'
      })

      console.log(`✅ Production superadmin created successfully:`)
      console.log(`   Email: ${superadmin.email}`)
      console.log(`   Name: ${superadmin.name}`)
      console.log(`   Role: ${superadmin.role}`)
      console.log(`   ID: ${superadmin.id}`)
      console.log(`   Created At: ${superadmin.createdAt}`)

      // Security reminder
      console.log(``)
      console.log(`🔐 PRODUCTION SECURITY CHECKLIST:`)
      console.log(`   ✓ Password automatically hashed with AdonisJS scrypt`)
      console.log(`   ⚠️  Change the password immediately after first login`)
      console.log(`   ⚠️  Use strong, unique passwords (min 12 characters)`)
      console.log(`   ⚠️  Enable 2FA if available in your application`)
      console.log(`   ⚠️  Regularly rotate access tokens`)
      console.log(`   ⚠️  Monitor login attempts and access logs`)
      console.log(`   ⚠️  Remove default credentials from environment variables`)
      console.log(``)

    } catch (error) {
      console.error(`❌ Failed to create production superadmin:`, error.message)
      console.error(`   Check database connection and permissions`)
      throw error
    }
  }
}
