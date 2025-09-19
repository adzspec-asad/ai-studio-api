// Test script to verify password hashing and verification
import { hash } from '@adonisjs/core/services/hash'
import SystemUserModel from '#models/system_user_model'
import db from '@adonisjs/lucid/services/db'

async function testPasswordVerification() {
  try {
    console.log('🔍 Testing password verification...')
    
    // Get the user from database
    const user = await SystemUserModel.query({ connection: 'master' })
      .where('email', 'superadmin@ai-studio.com')
      .first()
    
    if (!user) {
      console.log('❌ User not found!')
      return
    }
    
    console.log('✅ User found:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordStart: user.password.substring(0, 20) + '...'
    })
    
    // Test password verification
    const testPassword = 'SuperAdmin123!'
    console.log(`\n🔐 Testing password: "${testPassword}"`)
    
    // Method 1: Using hash service directly
    try {
      const isValid1 = await hash.verify(user.password, testPassword)
      console.log('Method 1 (hash.verify):', isValid1 ? '✅ Valid' : '❌ Invalid')
    } catch (error) {
      console.log('Method 1 error:', error.message)
    }
    
    // Method 2: Using model's verifyCredentials
    try {
      const verifiedUser = await SystemUserModel.verifyCredentials('superadmin@ai-studio.com', testPassword)
      console.log('Method 2 (verifyCredentials):', verifiedUser ? '✅ Valid' : '❌ Invalid')
    } catch (error) {
      console.log('Method 2 error:', error.message)
    }
    
    // Test with different passwords to see what happens
    const testPasswords = [
      'SuperAdmin123!',
      'superadmin123!',
      'SuperAdmin123',
      'Admin123!',
      'wrong-password'
    ]
    
    console.log('\n🧪 Testing multiple passwords:')
    for (const pwd of testPasswords) {
      try {
        const isValid = await hash.verify(user.password, pwd)
        console.log(`  "${pwd}": ${isValid ? '✅' : '❌'}`)
      } catch (error) {
        console.log(`  "${pwd}": ❌ Error - ${error.message}`)
      }
    }
    
    // Check hash configuration
    console.log('\n⚙️ Hash configuration:')
    console.log('Default hasher:', hash.use().constructor.name)
    
  } catch (error) {
    console.error('❌ Test failed:', error)
  } finally {
    await db.manager.closeAll()
    process.exit(0)
  }
}

testPasswordVerification()
