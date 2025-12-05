
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
    // Schedules and Inventory have M-N relation tables (implicit in Prisma)
    // Deleting the main entity usually clears the join table rows too.
    await prisma.schedule.deleteMany();
    await prisma.inventoryItem.deleteMany();
    await prisma.contact.deleteMany();

    // 3. Delete Core Entities
    await prisma.cat.deleteMany();
    
    // 4. Delete Users
    await prisma.user.deleteMany();

    console.log('✨ Database successfully cleaned.');
  } catch (error) {
    console.error('❌ Error cleaning database:', error);
    (process as any).exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
