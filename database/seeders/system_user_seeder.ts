import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SystemUserModel from '#models/system_user_model'
import { randomUUID } from 'node:crypto'

/**
 * Development seeder for creating system users with test credentials.
 * This seeder creates multiple users for development and testing purposes.
 *
 * For production, use production_system_user_seeder.ts instead.
 */
export default class extends BaseSeeder {
  async run() {
    console.log('🔄 Running development system user seeder...')

    // Define all system users to create
    const systemUsers = [
      {
        id: randomUUID(),
        name: 'Super Administrator',
        email: 'superadmin@ai-studio.com',
        password: 'SuperAdmin123!',
        role: 'superadmin' as const
      },
      {
        id: randomUUID(),
        name: 'Admin User',
        email: 'admin@ai-studio.com',
        password: 'Admin123!',
        role: 'admin' as const
      },
      {
        id: randomUUID(),
        name: 'Support User',
        email: 'support@ai-studio.com',
        password: 'Support123!',
        role: 'support' as const
      }
    ]

    // Create each user if they don't already exist
    for (const userData of systemUsers) {
      try {
        const existingUser = await SystemUserModel.query()
          .where('email', userData.email)
          .first()

        if (existingUser) {
          console.log(`⚠️  ${userData.role} user already exists: ${userData.email}`)
          continue
        }

        const user = await SystemUserModel.create(userData)
        console.log(`✅ ${userData.role} user created successfully:`)
        console.log(`   Email: ${user.email}`)
        console.log(`   Name: ${user.name}`)
        console.log(`   Role: ${user.role}`)
        console.log(`   ID: ${user.id}`)

        // Only show password for development seeder
        if (userData.role === 'superadmin') {
          console.log(`   Password: ${userData.password}`)
        }

      } catch (error) {
        console.error(`❌ Failed to create ${userData.role} user:`, error.message)
        throw error
      }
    }


    console.log('')
    console.log('🔐 Development Credentials Created:')
    console.log('   Superadmin: superadmin@ai-studio.com / SuperAdmin123!')
    console.log('   Admin:      admin@ai-studio.com / Admin123!')
    console.log('   Support:    support@ai-studio.com / Support123!')
    console.log('')
    console.log('⚠️  DEVELOPMENT ONLY - Change passwords in production!')
  }
}