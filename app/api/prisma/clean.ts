import { prisma } from '../src/config/db';

async function main() {
  console.log('🧹 Cleaning database...');

  try {
    // Delete in order to satisfy Foreign Key constraints
    // 1. Delete Child Records
    await prisma.litter.deleteMany();
    await prisma.adoptionRecord.deleteMany();
    await prisma.healthEvent.deleteMany();
    
    // 2. Delete User Utilities
    await prisma.schedule.deleteMany();
    await prisma.contact.deleteMany();

    // 3. Delete Core Entities
    // Note: Cats have self-relations (mother/father). 
    // Prisma usually handles deleteMany well, but strictly we clear the table.
    await prisma.cat.deleteMany();
    
    // 4. Delete Users
    await prisma.user.deleteMany();

    console.log('✨ Database successfully cleaned.');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
