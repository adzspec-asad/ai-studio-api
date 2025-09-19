// Simple script to create system users with proper password hashing
const crypto = require('crypto');

// AdonisJS scrypt configuration (from config/hash.ts)
const SCRYPT_CONFIG = {
  cost: 16384,
  blockSize: 8,
  parallelization: 1,
  maxMemory: 33554432,
};

// Function to hash password using scrypt (compatible with AdonisJS)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64, SCRYPT_CONFIG).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

// Generate the SQL with properly hashed passwords
const users = [
  {
    id: '550e8400-e29b-41d4-a716-446655440001',
    name: 'Super Administrator',
    email: 'superadmin@ai-studio.com',
    password: hashPassword('SuperAdmin123!'),
    role: 'superadmin'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440002',
    name: 'Admin User',
    email: 'admin@ai-studio.com',
    password: hashPassword('Admin123!'),
    role: 'admin'
  },
  {
    id: '550e8400-e29b-41d4-a716-446655440003',
    name: 'Support User',
    email: 'support@ai-studio.com',
    password: hashPassword('Support123!'),
    role: 'support'
  }
];

console.log('-- SQL to create system users with properly hashed passwords');
console.log('-- First, delete any existing users to avoid conflicts');
console.log("DELETE FROM system_users WHERE email IN ('superadmin@ai-studio.com', 'admin@ai-studio.com', 'support@ai-studio.com');");
console.log('');

console.log('-- Insert new users');
users.forEach(user => {
  console.log(`INSERT INTO system_users (id, name, email, password, role, created_at, updated_at)`);
  console.log(`VALUES ('${user.id}', '${user.name}', '${user.email}', '${user.password}', '${user.role}', NOW(), NOW());`);
});

console.log('');
console.log('-- Verify users were created');
console.log('SELECT id, name, email, role, created_at FROM system_users ORDER BY role;');

console.log('');
console.log('✅ System users will be created with the following credentials:');
console.log('  Superadmin: superadmin@ai-studio.com / SuperAdmin123!');
console.log('  Admin:      admin@ai-studio.com / Admin123!');
console.log('  Support:    support@ai-studio.com / Support123!');
console.log('');
console.log('🔐 Remember to change passwords after first login!');
