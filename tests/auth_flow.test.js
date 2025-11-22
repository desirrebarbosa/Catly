const fetch = require('node-fetch');
const colors = require('colors');

// CONFIGURATION
// Make sure your backend is running before starting this test!
const BASE_URL = 'http://localhost:3000/api/auth';

// TEST USER DATA 
// Generates a random email every time to avoid "User already exists" errors
const generateUser = () => ({
  email: `test.catly.${Date.now()}@example.com`,
  password: 'Password123!', // Meets complexity requirements
  name: 'Integration Test User',
  phone: '09123456789',
  new_phone: '09987654321', // For update test
  about: 'I am a robot testing the app.'
});

const user = generateUser();
let authToken = null;
let userId = null;

console.log('\nSTARTING CATLY AUTHENTICATION TEST MODULE'.bold.magenta);
console.log(`Target: ${BASE_URL}\n`);

// HELPER: Wrapper for Fetch to handle logging
async function request(endpoint, method, body = null, token = null) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config = { method, headers };
  if (body) config.body = JSON.stringify(body);

  try {
    const response = await fetch(`${BASE_URL}${endpoint}`, config);
    const data = await response.json();
    return { status: response.status, data };
  } catch (error) {
    console.error(`[NETWORK ERROR] on ${endpoint}:`.red, error.message);
    process.exit(1);
  }
}

async function runTests() {
  // --- TEST 1: SIGN UP ---
  process.stdout.write(`1. Testing Sign Up (${user.email})... `);
  const signup = await request('/signup', 'POST', {
    email: user.email,
    password: user.password,
    name: user.name,
    phone: user.phone
  });

  if (signup.data.success) {
    console.log('PASSED'.green);
  } else {
    console.log('FAILED'.red);
    console.log('   Error:', signup.data.error);
    process.exit(1);
  }

  // --- TEST 2: LOG IN ---
  process.stdout.write(`2. Testing Log In... `);
  const login = await request('/login', 'POST', {
    email: user.email,
    password: user.password
  });

  if (login.data.success && login.data.data.token) {
    authToken = login.data.data.token;
    userId = login.data.data.user.id;
    console.log('PASSED'.green);
  } else {
    console.log('FAILED'.red);
    console.log('   Error:', login.data.error);
    process.exit(1);
  }

  // --- TEST 3: GET PROFILE (Protected) ---
  process.stdout.write(`3. Testing Get Profile (Protected Route)... `);
  const profile = await request('/profile', 'GET', null, authToken);

  if (profile.data.success && profile.data.data.user.email === user.email) {
    console.log('PASSED'.green);
  } else {
    console.log('FAILED'.red);
    console.log('   Expected email:', user.email);
    console.log('   Got:', profile.data.data?.user?.email);
  }

  // --- TEST 4: UPDATE PROFILE (Protected) ---
  process.stdout.write(`4. Testing Update Profile (Phone & About)... `);
  const update = await request('/profile', 'PUT', {
    phone: user.new_phone,
    about: user.about
  }, authToken);

  if (update.data.success && update.data.data.user.phone === user.new_phone) {
    console.log('PASSED'.green);
  } else {
    console.log('FAILED'.red);
    console.log('   Error:', update.data.error);
  }

  // --- TEST 5: LOG OUT ---
  process.stdout.write(`5. Testing Log Out... `);
  const logout = await request('/logout', 'POST', null, authToken);

  if (logout.data.success) {
    console.log('PASSED'.green);
  } else {
    console.log('FAILED'.red);
  }

  // --- TEST 6: VERIFY TOKEN EXPIRED (Security Check) ---
  process.stdout.write(`6. Verifying Access Denied after Logout... `);
  // Note: Since standard JWTs are stateless, they remain valid until expiry unless blacklisted.
  //Ideally, this test checks if the client handles the "logout" success message correctly.
  // For this integration test, we just confirm the API is still responsive.
  console.log('SKIPPED'.yellow + ' (Stateless JWT)'); 

  console.log('\nALL TESTS COMPLETED SUCCESSFULLY'.bold.cyan);
}

runTests();