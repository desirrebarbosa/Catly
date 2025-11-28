
import { PORT } from '../config/env';

const BASE_URL = `http://localhost:${PORT}/api`;

// --- Professional ANSI Color Codes ---
const C = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  CYAN: '\x1b[36m',
  YELLOW: '\x1b[33m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

const printPass = (msg: string) => console.log(`${C.GREEN}${C.BOLD}[PASS]${C.RESET} ${msg}`);
const printFail = (msg: string) => console.error(`${C.RED}${C.BOLD}[FAIL]${C.RESET} ${msg}`);
const printInfo = (msg: string) => console.log(`${C.CYAN}[INFO]${C.RESET} ${msg}`);
const printStep = (step: number, msg: string) => console.log(`\n${C.BOLD}[STEP ${step}] ${msg}${C.RESET}`);

const createUser = async (name: string) => {
    const email = `test_${name}_${Date.now()}@catly.com`;
    const password = 'password123';
    
    const res = await fetch(`${BASE_URL}/auth/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password, name })
    });
    return res.json();
};

const createCat = async (token: string, name: string) => {
    return await fetch(`${BASE_URL}/cats`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            name,
            breed: 'TestBreed',
            gender: 'Female',
            weight: 4,
            birthDate: new Date().toISOString(),
            isSpayed: false,
            isArchived: false,
            photoUrl: 'https://placekitten.com/200/200'
        })
    });
};

const fetchCats = async (token: string) => {
    return await fetch(`${BASE_URL}/cats`, {
        method: 'GET',
        headers: { 'Authorization': `Bearer ${token}` }
    });
};

const runTest = async () => {
  console.log(`\n${C.BOLD}${C.GREEN}=== CATLY SYSTEM DIAGNOSTICS ===${C.RESET}`);
  console.log(`${C.CYAN}Target Endpoint:${C.RESET} ${BASE_URL}`);

  try {
    // [1] Connectivity
    printStep(1, "Checking API Connectivity");
    try {
        const res = await fetch(BASE_URL.replace('/api', '')); 
        if (res.status === 200) printPass("API is online and reachable.");
        else throw new Error(`Status ${res.status}`);
    } catch (e) {
        printFail("API is unreachable. Is the server running?");
        process.exit(1);
    }

    // [2] User Isolation Setup
    printStep(2, "Setting up User Isolation Test");
    
    // Create User A
    const userA = await createUser("UserA");
    if(!userA.success) throw new Error("Failed to create User A");
    printPass(`Created User A (ID: ${userA.data.user.id})`);

    // Create User B
    const userB = await createUser("UserB");
    if(!userB.success) throw new Error("Failed to create User B");
    printPass(`Created User B (ID: ${userB.data.user.id})`);

    // [3] Data Creation
    printStep(3, "Populating Data");
    
    // User A creates Cat A
    const catARes = await createCat(userA.data.token, "Cat_A_Owned");
    const catAData = await catARes.json();
    const catAId = catAData.data.cat.id;
    printPass("User A created 'Cat_A_Owned'");

    // User B creates Cat B
    const catBRes = await createCat(userB.data.token, "Cat_B_Owned");
    const catBData = await catBRes.json();
    const catBId = catBData.data.cat.id;
    printPass("User B created 'Cat_B_Owned'");

    // [4] Verifying Isolation (The critical user-based fetch test)
    printStep(4, "Verifying Data Isolation");

    // Fetch User A's List
    const listARes = await fetchCats(userA.data.token);
    const listA = await listARes.json();
    const catsA = listA.data.cats;

    // Fetch User B's List
    const listBRes = await fetchCats(userB.data.token);
    const listB = await listBRes.json();
    const catsB = listB.data.cats;

    // Checks for A
    const hasCatA = catsA.find((c: any) => c.id === catAId);
    const hasCatB = catsA.find((c: any) => c.id === catBId);

    if (hasCatA && !hasCatB) {
        printPass("User A sees ONLY their own cats.");
    } else {
        printFail("User A Data Leak! User A saw User B's cat or lost their own.");
        console.log(catsA);
        throw new Error("Isolation Failed");
    }

    // Checks for B
    const hasCatA_inB = catsB.find((c: any) => c.id === catAId);
    const hasCatB_inB = catsB.find((c: any) => c.id === catBId);

    if (hasCatB_inB && !hasCatA_inB) {
        printPass("User B sees ONLY their own cats.");
    } else {
        printFail("User B Data Leak! User B saw User A's cat.");
        throw new Error("Isolation Failed");
    }

    // [5] Cleanup
    printStep(5, "System Cleanup");
    // We only delete the cats we created
    await fetch(`${BASE_URL}/cats/${catAId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${userA.data.token}` }});
    await fetch(`${BASE_URL}/cats/${catBId}`, { method: 'DELETE', headers: { 'Authorization': `Bearer ${userB.data.token}` }});
    printPass("Test data purged.");

    console.log(`\n${C.GREEN}${C.BOLD}✅ ALL SYSTEMS FUNCTIONING NORMALLY${C.RESET}\n`);

  } catch (error: any) {
    console.log(`\n${C.RED}${C.BOLD}❌ DIAGNOSTICS ABORTED${C.RESET}`);
    printFail(error.message || error);
    process.exit(1);
  }
};

runTest();
