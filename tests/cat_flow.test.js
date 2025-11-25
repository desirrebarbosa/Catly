const TestClient = require('./lib/TestClient');

const client = new TestClient('http://localhost:3000/api');

// Test Data
const CAT_DATA = {
  name: 'Whiskers',
  gender: 'Male',
  color: 'Black and White',
  weight: 3.5,
  isSpayed: false
};

const USER_DATA = {
  email: `cat.owner.${Date.now()}@catly.com`,
  password: 'Password123!',
  name: 'Cat Owner'
};

async function runCatSuite() {
  console.log('\n \x1b[1mSTARTING CAT MANAGEMENT SUITE\x1b[0m');
  console.log('-----------------------------------');

  try {
    // 1. Setup: Create User specifically for this test
    const signupRes = await client.post('/auth/signup', USER_DATA, 'Setup: Creating User');
    client.setToken(signupRes.data.token);

    // 2. Create Cat
    const createRes = await client.post('/cats', CAT_DATA, 'Create Cat');
    const catId = createRes.data.cat.id;
    client.assert(catId, 'Cat ID must be returned');
    
    // Store ID for next steps
    client.store.catId = catId;

    // 3. Get My Cats
    const listRes = await client.get('/cats', 'Get My Cats');
    const myCats = listRes.data.cats;
    client.assert(myCats.length > 0, 'Should return at least 1 cat');
    client.assert(myCats[0].name === CAT_DATA.name, 'Cat name should match');

    // 4. Update Cat
    const updateData = { weight: 4.2, isSpayed: true };
    const updateRes = await client.put(`/cats/${client.store.catId}`, updateData, 'Update Cat Details');
    client.assert(updateRes.data.cat.weight === 4.2, 'Weight should be updated');

    // 5. Get Specific Cat Details
    const detailRes = await client.get(`/cats/${client.store.catId}`, 'Get Single Cat Details');
    client.assert(detailRes.data.cat.isSpayed === true, 'Spay status should be persisted');

    // 6. Delete Cat
    await client.delete(`/cats/${client.store.catId}`, 'Delete Cat');

    // 7. Verify Deletion
    try {
      await client.get(`/cats/${client.store.catId}`, 'Verify Deletion (Expect 404)');
      throw new Error('Cat should not be found');
    } catch (e) {
      if (e.response && e.response.status === 404) {
        console.log('   \x1b[32mConfirmed: Cat Not Found (404)\x1b[0m');
      } else {
        throw e;
      }
    }

    console.log('-----------------------------------');
    console.log('\x1b[32mCAT SUITE COMPLETED SUCCESSFULLY\x1b[0m\n');

  } catch (error) {
    console.log('-----------------------------------');
    console.log('\x1b[31mCAT SUITE CRASHED\x1b[0m\n');
    process.exit(1);
  }
}

// Allow running standalone
if (require.main === module) runCatSuite();

module.exports = runCatSuite;