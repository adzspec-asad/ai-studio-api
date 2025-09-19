// Test if the SystemUserModel can find the user
console.log('🔍 Testing SystemUserModel query...');

// Use ace command to run this in AdonisJS context
const testCode = `
import SystemUserModel from '#models/system_user_model'

async function testModelQuery() {
  try {
    console.log('1. Testing direct model query...');
    
    // Try to find the user
    const user = await SystemUserModel.query()
      .where('email', 'superadmin@ai-studio.com')
      .first();
    
    if (!user) {
      console.log('❌ User not found via model query');
      return;
    }
    
    console.log('✅ User found via model:', {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      passwordStart: user.password.substring(0, 30) + '...'
    });
    
    console.log('2. Testing verifyCredentials method...');
    
    try {
      const verifiedUser = await SystemUserModel.verifyCredentials('superadmin@ai-studio.com', 'SuperAdmin123!');
      console.log('✅ verifyCredentials successful:', {
        id: verifiedUser.id,
        email: verifiedUser.email,
        name: verifiedUser.name,
        role: verifiedUser.role
      });
    } catch (error) {
      console.log('❌ verifyCredentials failed:', error.message);
      console.log('Error details:', error);
    }
    
  } catch (error) {
    console.log('❌ Model query failed:', error.message);
    console.log('Error details:', error);
  }
}

testModelQuery();
`;

console.log('Generated test code. Run this with:');
console.log('docker-compose exec app node -e "' + testCode.replace(/"/g, '\\"') + '"');
