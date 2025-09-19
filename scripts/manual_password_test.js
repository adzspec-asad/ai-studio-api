// Manual password verification test using Node.js crypto
import crypto from 'crypto';

// The stored password hash from database
const storedHash = 'scrypt$9879a10f05b21c359880ccc9e7387849$aef37bd195a558a821b84e3550ea8c0e1848c48614a562480ddaf3967fbb1e7a921006467e96f7926b3ecda16ea26f65b8cbe4fe1789556fccfe81fba46e4f27';

// Test password
const testPassword = 'SuperAdmin123!';

// AdonisJS scrypt configuration
const SCRYPT_CONFIG = {
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  maxMemory: 33554432,
};

function verifyPassword(storedHash, password) {
  try {
    // Parse the stored hash
    const parts = storedHash.split('$');
    if (parts.length !== 3 || parts[0] !== 'scrypt') {
      console.log('❌ Invalid hash format');
      return false;
    }
    
    const salt = parts[1];
    const hash = parts[2];
    
    console.log('🔍 Hash parts:');
    console.log('  Algorithm:', parts[0]);
    console.log('  Salt:', salt);
    console.log('  Hash:', hash.substring(0, 20) + '...');
    
    // Generate hash with the same salt
    const testHash = crypto.scryptSync(password, salt, 64, SCRYPT_CONFIG).toString('hex');
    
    console.log('🧪 Generated hash:', testHash.substring(0, 20) + '...');
    console.log('🔍 Stored hash:   ', hash.substring(0, 20) + '...');
    
    // Compare hashes
    const isValid = testHash === hash;
    console.log('✅ Hashes match:', isValid);
    
    return isValid;
    
  } catch (error) {
    console.log('❌ Error during verification:', error.message);
    return false;
  }
}

console.log('🔐 Manual Password Verification Test');
console.log('=====================================');
console.log('Password:', testPassword);
console.log('Stored hash:', storedHash.substring(0, 50) + '...');
console.log('');

const result = verifyPassword(storedHash, testPassword);
console.log('');
console.log('🎯 Final result:', result ? '✅ VALID PASSWORD' : '❌ INVALID PASSWORD');

// Test with different passwords
console.log('\n🧪 Testing other passwords:');
const testPasswords = [
  'SuperAdmin123!',
  'superadmin123!', 
  'SuperAdmin123',
  'Admin123!',
  'wrong-password'
];

testPasswords.forEach(pwd => {
  const isValid = verifyPassword(storedHash, pwd);
  console.log(`  "${pwd}": ${isValid ? '✅' : '❌'}`);
});
