import { BaseSeeder } from '@adonisjs/lucid/seeders'
import { SystemUserFactory } from '#database/factories/system_user_factory'

/**
 * Factory-based seeder for creating system users using Lucid factories.
 * This is useful for testing and development environments where you need
 * multiple users with realistic but fake data.
 */
export default class extends BaseSeeder {
  async run() {
    console.log('🏭 Creating system users using factories...')

    // Create 1 superadmin
    const superadmin = await SystemUserFactory
      .apply('superadmin')
      .create()

    console.log(`✅ Superadmin created: ${superadmin.email}`)

    // Create 2-3 admin users
    const admins = await SystemUserFactory
      .apply('admin')
      .createMany(3)

    console.log(`✅ Created ${admins.length} admin users:`)
    admins.forEach(admin => {
      console.log(`   - ${admin.email} (${admin.name})`)
    })

    // Create 3-5 support users
    const supportUsers = await SystemUserFactory
      .apply('support')
      .createMany(4)

    console.log(`✅ Created ${supportUsers.length} support users:`)
    supportUsers.forEach(support => {
      console.log(`   - ${support.email} (${support.name})`)
    })

    console.log(``)
    console.log(`🎉 Factory seeding completed!`)
    console.log(`   Total users created: ${1 + admins.length + supportUsers.length}`)
    console.log(`   Default password for all users: Password123!`)
    console.log(``)
    console.log(`🔐 Security Note: Change passwords after first login!`)
  }
}
