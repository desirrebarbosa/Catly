
import { PORT } from '../config/env';

const BASE_URL = `http://192.168.1.169:${PORT}/api`;

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
const printHeader = (msg: string) => console.log(`\n${C.CYAN}${C.BOLD}--- ${msg} ---${C.RESET}`);

// --- Helper Functions ---
const post = async (endpoint: string, data: any, token?: string) => {
    const headers: any = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${endpoint}`, { method: 'POST', headers, body: JSON.stringify(data) });
    return res.json();
};

const get = async (endpoint: string, token: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { 
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    return res.json();
};

const put = async (endpoint: string, data: any, token: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { 
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(data)
    });
    return res.json();
};

const del = async (endpoint: string, token: string) => {
    const res = await fetch(`${BASE_URL}${endpoint}`, { 
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` } 
    });
    return res.json();
};

// --- Test Suite ---
const runTest = async () => {
  console.log(`\n${C.BOLD}${C.GREEN}=== CATLY RTM VALIDATION SUITE ===${C.RESET}`);
  let token = '';
  let userId = '';
  let catId = '';
  let scheduleId = '';
  let contactId = '';

  try {
    // ----------------------------------------------------
    // RTM 1-4: Authentication
    // ----------------------------------------------------
    printHeader("RTM 1-4: Authentication");
    const email = `rtm_user_${Date.now()}@catly.com`;
    
    // RTM 1: Signup
    const signup = await post('/auth/signup', { email, password: 'password123', name: 'RTM Tester' });
    if (!signup.success) throw new Error('Signup failed');
    printPass('User Registration (RTM 1)');
    
    // RTM 2: Login
    const login = await post('/auth/login', { email, password: 'password123' });
    if (!login.success) throw new Error('Login failed');
    token = login.data.token;
    userId = login.data.user.id;
    printPass('User Login (RTM 2)');

    // ----------------------------------------------------
    // RTM 5-16: Cat Profile Management
    // ----------------------------------------------------
    printHeader("RTM 5-16: Cat Profiles");

    // RTM 6, 8: Create Profile
    const createCat = await post('/cats', { name: 'RTM Cat', gender: 'Male', breed: 'Test', birthDate: new Date() }, token);
    if (!createCat.success) throw new Error('Create Cat failed');
    catId = createCat.data.cat.id;
    printPass('Create Cat Profile (RTM 6, 8)');

    // RTM 13: Edit Profile
    const updateCat = await put(`/cats/${catId}`, { name: 'RTM Cat Updated', gender: 'Male' }, token);
    if (updateCat.data.cat.name !== 'RTM Cat Updated') throw new Error('Update Cat failed');
    printPass('Edit Cat Details (RTM 13)');

    // RTM 9: List Cats
    const listCats = await get('/cats', token);
    if (listCats.data.cats.length !== 1) throw new Error('List Cats failed');
    printPass('View All Cats List (RTM 9)');

    // ----------------------------------------------------
    // RTM 17-22: Health Records
    // ----------------------------------------------------
    printHeader("RTM 17-22: Health Records");

    // RTM 17: Add Health Event
    const addHealth = await post(`/cats/${catId}/health`, { 
        title: 'Vaccine', eventType: 'Vaccination', date: new Date() 
    }, token);
    if (!addHealth.success) throw new Error('Add Health Event failed');
    const eventId = addHealth.data.event.id;
    printPass('Add Health Event (RTM 17)');

    // RTM 20: View History
    const history = await get(`/cats/${catId}/health`, token);
    if (history.data.events.length !== 1) throw new Error('View History failed');
    printPass('View Health History (RTM 20)');

    // RTM 19: Delete Event
    const delHealth = await del(`/cats/health/${eventId}`, token);
    if (!delHealth.success) throw new Error('Delete Event failed');
    printPass('Delete Health Event (RTM 19)');

    // ----------------------------------------------------
    // RTM 29-35: Scheduling
    // ----------------------------------------------------
    printHeader("RTM 29-35: Scheduling");

    // RTM 30: Create Schedule
    const addSched = await post('/schedules', { taskName: 'Meds', time: '10:00 AM', recurrence: 'Daily' }, token);
    if (!addSched.success) throw new Error('Add Schedule failed');
    scheduleId = addSched.data.schedule.id;
    printPass('Create Schedule (RTM 30)');

    // RTM 29: View Schedules
    const listSched = await get('/schedules', token);
    if (listSched.data.schedules.length === 0) throw new Error('List Schedules failed');
    printPass('View All Schedules (RTM 29)');

    // RTM 32: Delete Schedule
    const delSched = await del(`/schedules/${scheduleId}`, token);
    if (!delSched.success) throw new Error('Delete Schedule failed');
    printPass('Delete Schedule (RTM 32)');

    // ----------------------------------------------------
    // RTM 40-43: Contacts
    // ----------------------------------------------------
    printHeader("RTM 40-43: Contacts");

    // RTM 40: Add Contact
    const addContact = await post('/contacts', { name: 'Dr. Test', role: 'Vet', phone: '123' }, token);
    if (!addContact.success) throw new Error('Add Contact failed');
    contactId = addContact.data.contact.id;
    printPass('Add Contact (RTM 40)');

    // RTM 41: List Contacts
    const listContacts = await get('/contacts', token);
    if (listContacts.data.contacts.length === 0) throw new Error('List Contacts failed');
    printPass('View Contact List (RTM 41)');

    // ----------------------------------------------------
    // RTM 36-39: Adoption
    // ----------------------------------------------------
    printHeader("RTM 36-39: Adoption History");
    
    // RTM 37: Add Adoption Record
    const addAdopt = await post(`/adoptions/${catId}`, { date: new Date(), type: 'Adoption', adopterName: 'Me' }, token);
    if (!addAdopt.success) throw new Error('Add Adoption Record failed');
    printPass('Add Adoption Record (RTM 37)');

    console.log(`\n${C.GREEN}${C.BOLD}✅ ALL RTM SCENARIOS PASSED SUCCESSFULLY${C.RESET}\n`);

  } catch (error: any) {
    console.log(`\n${C.RED}${C.BOLD}❌ RTM VALIDATION FAILED${C.RESET}`);
    printFail(error.message || error);
    process.exit(1);
  }
};

runTest();
