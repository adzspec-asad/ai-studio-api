// Recreate system users with proper AdonisJS password hashing
const { Client } = require('pg');
const crypto = require('crypto');

// Database connection
const client = new Client({
  host: 'localhost',
  port: 5432,
  user: 'adonis',
  password: 'adonis',
  database: 'adonis_db'
});

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

// System users to create
const users = [
  {
    id: crypto.randomUUID(),
    name: 'Super Administrator',
    email: 'superadmin@ai-studio.com',
    password: 'SuperAdmin123!',
    role: 'superadmin'
  },
  {
    id: crypto.randomUUID(),
    name: 'Administrator',
    email: 'admin@ai-studio.com',
    password: 'Admin123!',
    role: 'admin'
  },
  {
    id: crypto.randomUUID(),
    name: 'Support User',
    email: 'support@ai-studio.com',
    password: 'Support123!',
    role: 'support'
  }
];

async function recreateSystemUsers() {
  try {
    console.log('🔄 Connecting to database...');
    await client.connect();

    console.log('🗑️ Deleting existing system users...');
    await client.query(`
      DELETE FROM system_users 
      WHERE email IN ('superadmin@ai-studio.com', 'admin@ai-studio.com', 'support@ai-studio.com')
    `);

    console.log('👥 Creating new system users...');
    for (const user of users) {
      const hashedPassword = hashPassword(user.password);
      
      console.log(`  Creating ${user.role}: ${user.email}`);
      
      await client.query(`
        INSERT INTO system_users (id, name, email, password, role, created_at, updated_at)
        VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
      `, [user.id, user.name, user.email, hashedPassword, user.role]);
    }

    console.log('✅ System users created successfully!');
    
    // Verify users were created
    console.log('\n📋 Verifying created users:');
    const result = await client.query(`
      SELECT id, name, email, role, LEFT(password, 25) as password_preview, created_at 
      FROM system_users 
      ORDER BY role
    `);
    
    console.table(result.rows);

    console.log('\n🔐 Login credentials:');
    users.forEach(user => {
      console.log(`  ${user.role.padEnd(10)}: ${user.email} / ${user.password}`);
    });

    console.log('\n🚀 You can now test login with these credentials!');

  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await client.end();
  }
}

recreateSystemUsers();
