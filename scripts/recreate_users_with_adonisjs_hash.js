// Recreate system users using AdonisJS hash service for compatibility
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'

async function recreateUsersWithAdonisHash() {
  try {
    console.log('🔄 Recreating system users with AdonisJS-compatible hashes...')
    
    // Users to create
    const users = [
      {
        id: randomUUID(),
        name: 'Super Administrator',
        email: 'superadmin@ai-studio.com',
        password: 'SuperAdmin123!',
        role: 'superadmin'
      },
      {
        id: randomUUID(),
        name: 'Administrator',
        email: 'admin@ai-studio.com',
        password: 'Admin123!',
        role: 'admin'
      },
      {
        id: randomUUID(),
        name: 'Support User',
        email: 'support@ai-studio.com',
        password: 'Support123!',
        role: 'support'
      }
    ]
    
    // Delete existing users
    console.log('🗑️ Deleting existing system users...')
    await db.rawQuery(`
      DELETE FROM system_users 
      WHERE email IN (?, ?, ?)
    `, ['superadmin@ai-studio.com', 'admin@ai-studio.com', 'support@ai-studio.com'])
    
    // Create new users with properly hashed passwords
    console.log('👥 Creating new system users with AdonisJS hash service...')
    for (const user of users) {
      console.log(`  Creating ${user.role}: ${user.email}`)
      
      // Hash password using AdonisJS hash service
      const hashedPassword = await hash.make(user.password)
      console.log(`    Password hash: ${hashedPassword.substring(0, 30)}...`)
      
      // Insert user into database
      await db.rawQuery(`
        INSERT INTO system_users (id, name, email, password, role, created_at, updated_at)
        VALUES (?, ?, ?, ?, ?, NOW(), NOW())
      `, [user.id, user.name, user.email, hashedPassword, user.role])
      
      // Verify the hash works
      const isValid = await hash.verify(hashedPassword, user.password)
      console.log(`    Hash verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
    }
    
    console.log('\n✅ System users recreated successfully!')
    
    // Verify users were created
    console.log('\n📋 Verifying created users:')
    const result = await db.rawQuery(`
      SELECT id, name, email, role, LEFT(password, 25) as password_preview, created_at 
      FROM system_users 
      ORDER BY role
    `)
    
    console.table(result.rows)
    
    console.log('\n🔐 Login credentials:')
    users.forEach(user => {
      console.log(`  ${user.role.padEnd(10)}: ${user.email} / ${user.password}`)
    })
    
    console.log('\n🚀 You can now test login with these credentials!')
    
  } catch (error) {
    console.error('❌ Error recreating users:', error)
  } finally {
    await db.manager.closeAll()
    process.exit(0)
  }
}

recreateUsersWithAdonisHash()
