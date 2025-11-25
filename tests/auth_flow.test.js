const TestClient = require('./lib/TestClient');

const client = new TestClient('http://localhost:3000/api/auth');

const TEST_USER = {
  email: `enterprise.test.${Date.now()}@catly.com`,
  password: 'Password123!',
  name: 'Enterprise User',
  phone: '09170001234'
};

async function runAuthSuite() {
  console.log('\n \x1b[1mSTARTING AUTHENTICATION SUITE\x1b[0m');
  console.log('-----------------------------------');

  try {
    // 1. Sign Up
    const signupRes = await client.post('/signup', TEST_USER, 'Sign Up');
    client.assert(signupRes.success, 'Response should be successful');

    // 2. Log In
    const loginRes = await client.post('/login', {
      email: TEST_USER.email,
      password: TEST_USER.password
    }, 'Log In');
    
    // Save token to client state
    client.setToken(loginRes.data.token);

    // 3. Get Profile
    const profileRes = await client.get('/profile', 'Get Profile');
    client.assert(
      profileRes.data.user.email === TEST_USER.email, 
      `Email should be ${TEST_USER.email}`
    );

    // 4. Update Profile
    const updateData = { about: 'Updated via Enterprise Test Suite' };
    const updateRes = await client.put('/profile', updateData, 'Update Profile');
    client.assert(
      updateRes.data.user.about === updateData.about, 
      'Bio should be updated'
    );

    // 5. Log Out
    await client.post('/logout', {}, 'Log Out');

    console.log('-----------------------------------');
    console.log('\x1b[32mAUTH SUITE COMPLETED SUCCESSFULLY\x1b[0m\n');
    
    // Return token for other tests to use if needed
    return client.token;

  } catch (error) {
    console.log('-----------------------------------');
    console.log(' \x1b[31mAUTH SUITE CRASHED\x1b[0m\n');
    process.exit(1);
  }
}

// Allow running standalone or imported
if (require.main === module) runAuthSuite();

module.exports = { runAuthSuite, client };