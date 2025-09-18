import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SystemUserModel from '#models/system_user_model'
import env from '#start/env'

/**
 * Production-ready seeder that uses environment variables
 * for superadmin credentials. This is more secure than hardcoded values.
 */
export default class extends BaseSeeder {
  async run() {
    // Get superadmin credentials from environment variables
    const superadminEmail = env.get('SUPERADMIN_EMAIL', 'superadmin@ai-studio.com')
    const superadminPassword = env.get('SUPERADMIN_PASSWORD', 'SuperAdmin123!')
    const superadminName = env.get('SUPERADMIN_NAME', 'Super Administrator')

    // Check if superadmin already exists
    const existingSuperadmin = await SystemUserModel.query()
      .where('email', superadminEmail)
      .orWhere('role', 'superadmin')
      .first()

    if (existingSuperadmin) {
      console.log(`⚠️  Superadmin already exists: ${existingSuperadmin.email}`)
      return
    }

    // Create the superadmin user
    try {
      const superadmin = await SystemUserModel.create({
        name: superadminName,
        email: superadminEmail,
        password: superadminPassword, // This will be automatically hashed
        role: 'superadmin'
      })

      console.log(`✅ Superadmin created successfully:`)
      console.log(`   Email: ${superadmin.email}`)
      console.log(`   Name: ${superadmin.name}`)
      console.log(`   Role: ${superadmin.role}`)
      console.log(`   ID: ${superadmin.id}`)
      console.log(`   Created At: ${superadmin.createdAt}`)
      
      // Security reminder
      console.log(``)
      console.log(`🔐 SECURITY REMINDER:`)
      console.log(`   - Change the default password immediately after first login`)
      console.log(`   - Use strong, unique passwords for production`)
      console.log(`   - Consider enabling 2FA if available`)
      console.log(`   - Regularly rotate access tokens`)
      
    } catch (error) {
      console.error(`❌ Failed to create superadmin:`, error.message)
      throw error
    }
  }
}
