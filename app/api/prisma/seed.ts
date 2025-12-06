import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function createUser(email: string, name: string, about: string, pass: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);
    
    // Using upsert ensures we don't crash if user exists, but we update their details
    return await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword, name, about },
        create: { email, password: hashedPassword, name, about },
    });
}

async function main() {
  console.log('Starting Comprehensive Catly Seeding...');

  // --------------------------------------------------------
  // 0. CLEANUP (Optional: Be careful using this in Prod)
  // --------------------------------------------------------
  // This ensures a clean state for your Demo videos so IDs don't conflict
  console.log('🧹 Cleaning up old data...');
  try {
      // Delete in order of dependencies (Child -> Parent)
      await prisma.healthEvent.deleteMany();
      await prisma.schedule.deleteMany();
      await prisma.adoptionRecord.deleteMany();
      await prisma.litter.deleteMany();
      await prisma.contact.deleteMany();
      await prisma.cat.deleteMany();
      await prisma.user.deleteMany();
  } catch (e) {
      console.log('   (First run or cleanup skipped)');
  }

  try {
    // ==========================================
    // 1. BEATRICE ABADIANO (Target User / Breeder)
    // ==========================================
    // RTM Story ID: 5, 6, 26
    console.log('👤 Creating Beatrice (The Main Demo User)...');
    const beatrice = await createUser(
        'beatrice@catly.com', 
        'Beatrice Abadiano', 
        'I love my Cats', 
        'Password123'
    );

    // --- CONTACTS (Story ID 40) ---
    console.log('   - Adding Contacts...');
    const vet = await prisma.contact.create({
        data: { ownerId: beatrice.id, name: 'Dr. Arlo Smith', role: 'Veterinarian', phone: '0917-555-0199', email: 'arlo@vetclinic.com' }
    });
    const buyer = await prisma.contact.create({
        data: { ownerId: beatrice.id, name: 'Mrs. Higgins', role: 'Adopter', phone: '0918-555-9988' }
    });

    // --- CATS & LINEAGE (Story ID 6, 26, 28) ---
    console.log('   - Creating Cat Lineage...');
    
    // 1. Grandparents / Parents
    const luna = await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Luna', breed: 'Siamese', gender: 'Female', weight: 4.5,
            birthDate: new Date('2020-05-15'), color: 'Cream Point', 
            photoUrl: 'https://images.unsplash.com/photo-1513245543132-31f507417b26?auto=format&fit=crop&q=80&w=200',
        }
    });

    const simba = await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Simba', breed: 'Siamese', gender: 'Male', weight: 5.2,
            birthDate: new Date('2019-08-20'), color: 'Seal Point',
            photoUrl: 'https://images.unsplash.com/photo-1561948955-570b270e7c36?auto=format&fit=crop&q=80&w=200',
        }
    });

    // 2. Litter (Story ID 23)
    const litter1 = await prisma.litter.create({
        data: {
            motherId: luna.id, fatherId: simba.id,
            dateOfBirth: new Date('2023-01-10'), kittenCount: 3,
            notes: 'Luna’s first litter. Very healthy.'
        }
    });

    // 3. Offspring (Linked to Parents)
    const nala = await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Nala', breed: 'Siamese', gender: 'Female', weight: 3.2,
            birthDate: new Date('2023-01-10'),
            motherId: luna.id, fatherId: simba.id, litterId: litter1.id, // Full Lineage Link
            photoUrl: 'https://images.unsplash.com/photo-1519052537078-e6302a4968ef?auto=format&fit=crop&q=80&w=200',
        }
    });

    // 4. An Archived Cat (Story ID 15, 16)
    // This allows you to demo the "View Archived" or "Restore" feature immediately
    await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Old Tom', breed: 'Domestic Short Hair', gender: 'Male', weight: 6.0,
            birthDate: new Date('2010-01-01'), 
            isArchived: true, // <--- Key for RTM Story 16
            photoUrl: 'https://placekitten.com/205/205'
        }
    });

    // --- HEALTH RECORDS (Story ID 17, 20) ---
    console.log('   - Adding Health History...');
    await prisma.healthEvent.createMany({
        data: [
            {
                catId: nala.id, eventType: 'Vaccination', title: 'Rabies Shot',
                date: new Date('2023-04-01'), notes: 'Routine annual vaccination.',
            },
            {
                catId: nala.id, eventType: 'Illness', title: 'Mild Fever',
                date: new Date('2023-06-15'), notes: 'Prescribed antibiotics by Dr. Smith.',
            },
            {
                catId: luna.id, eventType: 'Surgery', title: 'Spay',
                date: new Date('2024-01-20'), notes: 'Recovered well.',
            }
        ]
    });

    // --- SCHEDULES (Story ID 30, 33) ---
    // Note: This assumes Schedule has a Many-to-Many relation with Cat
    console.log('   - Setting Schedules...');
    await prisma.schedule.create({
        data: {
            userId: beatrice.id,
            taskName: 'Morning Feeding', time: '08:00', recurrence: 'Daily',
            cats: { connect: [{ id: luna.id }, { id: simba.id }, { id: nala.id }] }
        }
    });

    await prisma.schedule.create({
        data: {
            userId: beatrice.id,
            taskName: 'Nala Medication', time: '18:00', recurrence: 'Daily',
            cats: { connect: [{ id: nala.id }] }
        }
    });

    // --- ADOPTION HISTORY (Story ID 36) ---
    console.log('   - Creating Adoption Records...');
    // A kitten from the litter that was sold
    const soldKitten = await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Oscar', breed: 'Siamese', gender: 'Male', weight: 3.5,
            birthDate: new Date('2023-01-10'),
            motherId: luna.id, fatherId: simba.id, litterId: litter1.id,
            isArchived: true, // Archived because it's no longer in her cattery
            photoUrl: 'https://placekitten.com/206/206'
        }
    });

    await prisma.adoptionRecord.create({
        data: {
            catId: soldKitten.id,
            date: new Date('2023-05-20'), type: 'Adoption',
            contactId: buyer.id, adopterName: buyer.name, 
            notes: 'Sold to Mrs. Higgins. Full breeding rights transferred.'
        }
    });

    // ==========================================
    // 2. JOHN DOE (The Casual User)
    // ==========================================
    // Use this user if you want to show a "cleaner" UI with less data
    console.log('👤 Creating John (Casual User)...');
    const john = await createUser('john@catly.com', 'John Doe', 'Just a guy with a cat.', 'Password123');

    const garfield = await prisma.cat.create({
        data: {
            ownerId: john.id, name: 'Garfield', breed: 'Tabby', gender: 'Male', weight: 8.5,
            birthDate: new Date('2018-01-01'), color: 'Orange',
            photoUrl: 'https://images.unsplash.com/photo-1574158622682-e40e69881006?auto=format&fit=crop&q=80&w=200'
        }
    });

    await prisma.schedule.create({
        data: {
            userId: john.id, cats: { connect: [{ id: garfield.id }] },
            taskName: 'Buy Lasagna', time: '12:00', recurrence: 'Weekly'
        }
    });

    console.log('\n=============================================');
    console.log('✅ SEEDING COMPLETE');
    console.log('=============================================');
    console.log('🔑 MAIN DEMO USER (Beatrice):');
    console.log('   Email: beatrice@catly.com');
    console.log('   Pass:  Password123');
    console.log('---------------------------------------------');
    console.log('🔑 SECONDARY USER (John):');
    console.log('   Email: john@catly.com');
    console.log('   Pass:  Password123');
    console.log('=============================================');

  } catch (error: any) {
    console.error('❌ Seed failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();