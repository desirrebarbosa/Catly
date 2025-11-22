const axios = require('axios');

const API_URL = 'http://localhost:3000/api/auth';
const TEST_USER = {
  email: `test.catly.${Date.now()}@example.com`,
  password: 'Password123!',
  name: 'Test User',
  phone: '09171234567'
};

let authToken = '';

async function runTests() {
  console.log('STARTING CATLY AUTHENTICATION TEST MODULE');
  console.log(`Target: ${API_URL}\n`);

  try {
    // 1. Sign Up
    process.stdout.write(`1. Testing Sign Up (${TEST_USER.email})... `);
    const signupRes = await axios.post(`${API_URL}/signup`, TEST_USER);
    if (signupRes.data.success) console.log('PASSED');

    // 2. Log In
    process.stdout.write('2. Testing Log In... ');
    const loginRes = await axios.post(`${API_URL}/login`, {
      email: TEST_USER.email,
      password: TEST_USER.password
    });
    authToken = loginRes.data.data.token; // Get Token
    if (loginRes.data.success) console.log('PASSED');

    // 3. Get Profile
    process.stdout.write('3. Testing Get Profile (Protected)... ');
    const profileRes = await axios.get(`${API_URL}/profile`, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (profileRes.data.data.user.email === TEST_USER.email) {
      console.log('PASSED');
    } else {
      console.log('FAILED (Email mismatch)');
    }

    // 4. Update Profile
    process.stdout.write('4. Testing Update Profile... ');
    const updateRes = await axios.put(`${API_URL}/profile`, 
      { about: 'Test Bio' },
      { headers: { Authorization: `Bearer ${authToken}` } }
    );
    if (updateRes.data.success) console.log('PASSED');

    // 5. Log Out
    process.stdout.write('5. Testing Log Out... ');
    const logoutRes = await axios.post(`${API_URL}/logout`, {}, {
      headers: { Authorization: `Bearer ${authToken}` }
    });
    if (logoutRes.data.success) console.log('PASSED');

  } catch (error) {
    console.log('FAILED');
    if (error.response) {
      console.log(`   Error: ${error.response.data.error}`);
      if (error.response.data.details) console.log(`   Details: ${error.response.data.details}`);
    } else {
      console.log(`   Error: ${error.message}`);
    }
  }
}

runTests();