// Simple script to generate properly hashed passwords for manual insertion
import crypto from 'crypto';

// AdonisJS-compatible scrypt configuration
const SCRYPT_CONFIG = {
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  maxMemory: 33554432,
};

// Function to hash password using scrypt (AdonisJS format)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, SCRYPT_CONFIG).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

// Generate hashed passwords
const passwords = {
  'SuperAdmin123!': hashPassword('SuperAdmin123!'),
  'Admin123!': hashPassword('Admin123!'),
  'Support123!': hashPassword('Support123!')
};

console.log('🔐 Generated password hashes:');
console.log('SuperAdmin123!:', passwords['SuperAdmin123!']);
console.log('Admin123!:', passwords['Admin123!']);
console.log('Support123!:', passwords['Support123!']);

// Generate SQL statements
console.log('\n📝 SQL INSERT statements:');

const users = [
  {
    id: crypto.randomUUID(),
    name: 'Super Administrator',
    email: 'superadmin@ai-studio.com',
    password: passwords['SuperAdmin123!'],
    role: 'superadmin'
  },
  {
    id: crypto.randomUUID(),
    name: 'Administrator', 
    email: 'admin@ai-studio.com',
    password: passwords['Admin123!'],
    role: 'admin'
  },
  {
    id: crypto.randomUUID(),
    name: 'Support User',
    email: 'support@ai-studio.com',
    password: passwords['Support123!'],
    role: 'support'
  }
];

users.forEach(user => {
  console.log(`INSERT INTO system_users (id, name, email, password, role, created_at, updated_at) VALUES ('${user.id}', '${user.name}', '${user.email}', '${user.password}', '${user.role}', NOW(), NOW());`);
});

console.log('\n✅ Copy and paste these SQL statements into the database!');
