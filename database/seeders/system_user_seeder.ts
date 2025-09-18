import { BaseSeeder } from '@adonisjs/lucid/seeders'
import SystemUserModel from '#models/system_user_model'

export default class extends BaseSeeder {
  async run() {
    // Check if superadmin already exists
    const existingSuperadmin = await SystemUserModel.query()
      .where('role', 'superadmin')
      .first()

    if (existingSuperadmin) {
      console.log('Superadmin already exists, skipping seeder')
      return
    }

    // Create the superadmin user
    const superadmin = await SystemUserModel.create({
      id: '1', // Fixed ID for consistency
      name: 'Super Administrator',
      email: 'superadmin@ai-studio.com',
      password: 'SuperAdmin123!', // This will be automatically hashed
      role: 'superadmin'
    })

    console.log(`✅ Superadmin created successfully:`)
    console.log(`   Email: ${superadmin.email}`)
    console.log(`   Password: SuperAdmin123!`)
    console.log(`   Role: ${superadmin.role}`)
    console.log(`   ID: ${superadmin.id}`)

    // Optionally create additional admin users for testing
    const adminUsers = [
      {
        id: '2',
        name: 'Admin User',
        email: 'admin@ai-studio.com',
        password: 'Admin123!',
        role: 'admin' as const
      },
      {
        id: '3',
        name: 'Support User',
        email: 'support@ai-studio.com',
        password: 'Support123!',
        role: 'support' as const
      }
    ]

    for (const userData of adminUsers) {
      const existingUser = await SystemUserModel.query()
        .where('email', userData.email)
        .first()

      if (!existingUser) {
        const user = await SystemUserModel.create(userData)
        console.log(`✅ ${userData.role} user created: ${user.email}`)
      } else {
        console.log(`⚠️  ${userData.role} user already exists: ${userData.email}`)
      }
    }
  }
}