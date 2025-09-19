import { BaseCommand } from '@adonisjs/core/ace'
import type { CommandOptions } from '@adonisjs/core/types/ace'
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'
import { randomUUID } from 'node:crypto'

export default class RecreateSystemUsers extends BaseCommand {
  static commandName = 'recreate:system-users'
  static description = 'Recreate system users with proper AdonisJS password hashing'

  static options: CommandOptions = {
    startApp: true,
    allowUnknownFlags: false,
    staysAlive: false,
  }

  async run() {
    this.logger.info('🔄 Recreating system users with AdonisJS-compatible hashes...')
    
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
    
    try {
      // Delete existing users
      this.logger.info('🗑️ Deleting existing system users...')
      await db.rawQuery(`
        DELETE FROM system_users 
        WHERE email IN (?, ?, ?)
      `, ['superadmin@ai-studio.com', 'admin@ai-studio.com', 'support@ai-studio.com'])
      
      // Create new users with properly hashed passwords
      this.logger.info('👥 Creating new system users with AdonisJS hash service...')
      for (const user of users) {
        this.logger.info(`  Creating ${user.role}: ${user.email}`)
        
        // Hash password using AdonisJS hash service
        const hashedPassword = await hash.make(user.password)
        this.logger.info(`    Password hash: ${hashedPassword.substring(0, 30)}...`)
        
        // Insert user into database
        await db.rawQuery(`
          INSERT INTO system_users (id, name, email, password, role, created_at, updated_at)
          VALUES (?, ?, ?, ?, ?, NOW(), NOW())
        `, [user.id, user.name, user.email, hashedPassword, user.role])
        
        // Verify the hash works
        const isValid = await hash.verify(hashedPassword, user.password)
        this.logger.info(`    Hash verification: ${isValid ? '✅ Valid' : '❌ Invalid'}`)
      }
      
      this.logger.success('✅ System users recreated successfully!')
      
      // Verify users were created
      this.logger.info('📋 Verifying created users:')
      const result = await db.rawQuery(`
        SELECT id, name, email, role, LEFT(password, 25) as password_preview, created_at 
        FROM system_users 
        ORDER BY role
      `)
      
      console.table(result.rows)
      
      this.logger.info('🔐 Login credentials:')
      users.forEach(user => {
        this.logger.info(`  ${user.role.padEnd(10)}: ${user.email} / ${user.password}`)
      })
      
      this.logger.success('🚀 You can now test login with these credentials!')
      
    } catch (error) {
      this.logger.error('❌ Error recreating users:', error)
      this.exitCode = 1
    }
  }
}
