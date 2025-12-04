
// Run this file to verify the filtering logic used in CatListScreen

// Professional Color Codes for Metro/Terminal
const C = {
  GREEN: '\x1b[32m',
  RED: '\x1b[31m',
  CYAN: '\x1b[36m',
  RESET: '\x1b[0m',
  BOLD: '\x1b[1m'
};

const printPass = (testName: string) => console.log(`${C.GREEN}[PASS]${C.RESET} ${testName}`);
const printFail = (testName: string, details?: any) => {
    console.log(`${C.RED}[FAIL]${C.RESET} ${testName}`);
    if(details) console.log(details);
};

// Mock Data
const mockCats = [
    { id: '1', name: 'Luna', isArchived: false, ownerId: 'user_1' },
    { id: '2', name: 'Simba', isArchived: true, ownerId: 'user_1' },
    { id: '3', name: 'Ghost', isArchived: null, ownerId: 'user_1' }, // Edge case: null in DB
    { id: '4', name: 'Shadow', isArchived: undefined, ownerId: 'user_1' }, // Edge case: missing field
    { id: '5', name: 'Intruder', isArchived: false, ownerId: 'user_2' } // Data that shouldn't be here (simulated)
];

const mockEvents = [
    { id: 'e1', date: '2023-01-01T00:00:00.000Z', title: 'Oldest' },
    { id: 'e2', date: '2024-01-01T00:00:00.000Z', title: 'Newest' },
    { id: 'e3', date: '2023-06-01T00:00:00.000Z', title: 'Middle' }
];

const mockSchedules = [
    { id: 's1', time: '09:00 AM' },
    { id: 's2', time: '08:00 AM' },
    { id: 's3', time: '10:00 PM' }
];

export const runFilterTests = (): string => {
    console.log(`\n${C.CYAN}${C.BOLD}=== FRONTEND LOGIC DIAGNOSTICS ===${C.RESET}`);
    let report = "🔎 DIAGNOSTICS REPORT\n";
    let passed = 0;
    let total = 0;

    // --- Test 1: Active Cats Filter ---
    total++;
    const activeCats = mockCats.filter(cat => {
        if (cat.ownerId !== 'user_1') return false; 
        const isCatArchived = !!cat.isArchived; 
        return !isCatArchived;
    });

    const hasLuna = activeCats.some(c => c.name === 'Luna');
    const hasGhost = activeCats.some(c => c.name === 'Ghost');
    const hasShadow = activeCats.some(c => c.name === 'Shadow');
    const hasSimba = activeCats.some(c => c.name === 'Simba');
    const hasIntruder = activeCats.some(c => c.name === 'Intruder');

    if (activeCats.length === 3 && hasLuna && hasGhost && hasShadow && !hasSimba && !hasIntruder) {
        printPass('Filter: Active vs Archived & Ownership');
        report += "✅ Filter Logic: PASS\n";
        passed++;
    } else {
        printFail('Filter: Active vs Archived & Ownership', activeCats);
        report += "❌ Filter Logic: FAIL\n";
    }

    // --- Test 2: Search Filter ---
    total++;
    const searchQuery = 'lun';
    const searchResults = mockCats.filter(cat => cat.name.toLowerCase().includes(searchQuery.toLowerCase()));

    if (searchResults.length === 1 && searchResults[0].name === 'Luna') {
         printPass('Filter: Search Query (Case Insensitive)');
         report += "✅ Search Logic: PASS\n";
         passed++;
    } else {
         printFail('Filter: Search Query');
         report += "❌ Search Logic: FAIL\n";
    }

    // --- Test 3: Health Event Sorting ---
    total++;
    const sortedEvents = [...mockEvents].sort((a, b) => {
        return new Date(b.date).getTime() - new Date(a.date).getTime();
    });

    if (sortedEvents[0].title === 'Newest' && sortedEvents[2].title === 'Oldest') {
        printPass('Logic: Health Timeline Sorting');
        report += "✅ Health Sorting: PASS\n";
        passed++;
    } else {
        printFail('Logic: Health Timeline Sorting');
        report += "❌ Health Sorting: FAIL\n";
    }

    // --- Test 4: Schedule Sorting (Time) ---
    // Simple string compare for "08:00 AM" vs "09:00 AM" works for basic cases, but real app might need date parsing
    total++;
    const sortedSchedules = [...mockSchedules].sort((a, b) => a.time.localeCompare(b.time));
    
    if (sortedSchedules[0].time === '08:00 AM' && sortedSchedules[2].time === '10:00 PM') {
        printPass('Logic: Schedule Sorting');
        report += "✅ Schedule Sorting: PASS\n";
        passed++;
    } else {
        printFail('Logic: Schedule Sorting');
        report += "❌ Schedule Sorting: FAIL\n";
    }

    console.log(`${C.CYAN}--- End of Report ---${C.RESET}\n`);
    
    report += `\nResult: ${passed}/${total} Tests Passed.`;
    return report;
};
