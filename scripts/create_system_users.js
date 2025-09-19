// Simple script to create system users directly in the database
// This bypasses the seeder issues and creates users directly

const { Client } = require('pg');
const crypto = require('crypto');

// Database connection configuration
const dbConfig = {
  host: 'postgres',
  port: 5432,
  user: 'adonis',
  password: 'secret',
  database: 'adonis_db'
};

// Function to hash password using scrypt (similar to AdonisJS)
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `scrypt$${salt}$${hash}`;
}

// Function to generate UUID
function generateUUID() {
  return crypto.randomUUID();
}

async function createSystemUsers() {
  const client = new Client(dbConfig);
  
  try {
    await client.connect();
    console.log('✅ Connected to database');

    // Check if superadmin already exists
    const existingUser = await client.query(
      'SELECT * FROM system_users WHERE role = $1 OR email = $2',
      ['superadmin', 'superadmin@ai-studio.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('⚠️  Superadmin already exists, skipping creation');
      return;
    }

    // Create system users
    const users = [
      {
        id: generateUUID(),
        name: 'Super Administrator',
        email: 'superadmin@ai-studio.com',
        password: hashPassword('SuperAdmin123!'),
        role: 'superadmin'
      },
      {
        id: generateUUID(),
        name: 'Admin User',
        email: 'admin@ai-studio.com',
        password: hashPassword('Admin123!'),
        role: 'admin'
      },
      {
        id: generateUUID(),
        name: 'Support User',
        email: 'support@ai-studio.com',
        password: hashPassword('Support123!'),
        role: 'support'
      }
    ];

    for (const user of users) {
      await client.query(
        `INSERT INTO system_users (id, name, email, password, role, created_at, updated_at) 
         VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
        [user.id, user.name, user.email, user.password, user.role]
      );
      
      console.log(`✅ Created ${user.role}: ${user.email}`);
    }

    console.log('');
    console.log('🎉 System users created successfully!');
    console.log('');
    console.log('Login credentials:');
    console.log('  Superadmin: superadmin@ai-studio.com / SuperAdmin123!');
    console.log('  Admin:      admin@ai-studio.com / Admin123!');
    console.log('  Support:    support@ai-studio.com / Support123!');
    console.log('');
    console.log('🔐 Remember to change passwords after first login!');

  } catch (error) {
    console.error('❌ Error creating system users:', error.message);
    throw error;
  } finally {
    await client.end();
    console.log('✅ Database connection closed');
  }
}

// Run the script
createSystemUsers().catch(console.error);
