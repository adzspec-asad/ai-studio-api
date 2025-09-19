// Debug authentication process
import hash from '@adonisjs/core/services/hash'
import db from '@adonisjs/lucid/services/db'

async function debugAuth() {
  try {
    console.log('🔍 Debugging authentication process...')
    
    // Test database connection
    console.log('\n1. Testing database connection...')
    const masterDb = db.connection('master')
    const result = await masterDb.rawQuery('SELECT NOW() as current_time')
    console.log('✅ Master DB connected:', result.rows[0].current_time)
    
    // Get user from database
    console.log('\n2. Fetching user from database...')
    const userQuery = await masterDb.rawQuery(`
      SELECT id, name, email, password, role, created_at 
      FROM system_users 
      WHERE email = ?
    `, ['superadmin@ai-studio.com'])
    
    if (userQuery.rows.length === 0) {
      console.log('❌ User not found in database!')
      return
    }
    
    const user = userQuery.rows[0]
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordStart: user.password.substring(0, 30) + '...'
    })
    
    // Test password verification
    console.log('\n3. Testing password verification...')
    const testPassword = 'SuperAdmin123!'
    console.log(`Testing password: "${testPassword}"`)
    
    try {
      const isValid = await hash.verify(user.password, testPassword)
      console.log('Password verification result:', isValid ? '✅ VALID' : '❌ INVALID')
      
      if (!isValid) {
        console.log('\n🔍 Debugging password hash...')
        console.log('Stored hash:', user.password)
        console.log('Hash parts:', user.password.split('$'))
        
        // Test with a fresh hash
        console.log('\n🧪 Creating fresh hash for comparison...')
        const freshHash = await hash.make(testPassword)
        console.log('Fresh hash:', freshHash)
        
        const freshVerify = await hash.verify(freshHash, testPassword)
        console.log('Fresh hash verification:', freshVerify ? '✅ VALID' : '❌ INVALID')
      }
      
    } catch (error) {
      console.log('❌ Password verification error:', error.message)
    }
    
    // Test different passwords
    console.log('\n4. Testing various password combinations...')
    const testPasswords = [
      'SuperAdmin123!',
      'superadmin123!',
      'SuperAdmin123',
      'Admin123!',
      'wrong-password'
    ]
    
    for (const pwd of testPasswords) {
      try {
        const isValid = await hash.verify(user.password, pwd)
        console.log(`  "${pwd}": ${isValid ? '✅' : '❌'}`)
      } catch (error) {
        console.log(`  "${pwd}": ❌ Error - ${error.message}`)
      }
    }
    
    // Check hash configuration
    console.log('\n5. Hash configuration:')
    const hasher = hash.use('scrypt')
    console.log('Hasher type:', hasher.constructor.name)
    
  } catch (error) {
    console.error('❌ Debug failed:', error)
  } finally {
    await db.manager.closeAll()
    process.exit(0)
  }
}

debugAuth()
