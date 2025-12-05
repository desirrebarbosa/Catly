
import { prisma } from '../src/config/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // 1. Create User
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await prisma.user.upsert({
      where: { email: 'admin@catly.com' },
      update: {
        password: hashedPassword,
        name: 'Beatrice Abadiano',
        phone: '09171234567',
        about: 'Cat lover and breeder. Every day is a purr-fect day to care!',
      },
      create: {
        email: 'admin@catly.com',
        password: hashedPassword,
        name: 'Beatrice Abadiano',
        phone: '09171234567',
        about: 'Cat lover and breeder. Every day is a purr-fect day to care!',
      },
    });

    console.log(`👤 User synced: ${user.name}`);

    // 2. Create Contacts
    await prisma.contact.create({
      data: {
        ownerId: user.id,
        name: 'Dr. Smith (Vet)',
        role: 'Veterinarian',
        phone: '555-0123',
        email: 'dr.smith@vetclinic.com'
      }
    });

    // 4. Create Parent Cats
    const luna = await prisma.cat.create({
      data: {
        ownerId: user.id,
        name: 'Luna',
        nickname: 'Lulu',
        breed: 'Siamese',
        gender: 'Female',
        weight: 4.5,
        birthDate: new Date('2020-05-15'),
        color: 'Cream Point',
        eyeColor: 'Blue',
        features: 'Very vocal, crossed eyes occasionally',
        isSpayed: false,
        isArchived: false,
        photoUrl: 'https://placekitten.com/200/200',
      },
    });

    const simba = await prisma.cat.create({
      data: {
        ownerId: user.id,
        name: 'Simba',
        nickname: 'King',
        breed: 'Orange Tabby',
        gender: 'Male',
        weight: 6.2,
        birthDate: new Date('2019-08-20'),
        color: 'Orange Striped',
        eyeColor: 'Green',
        features: 'M mark on forehead, fluffy tail',
        isSpayed: false,
        isArchived: false,
        photoUrl: 'https://placekitten.com/201/201',
      },
    });

    console.log(`🐱 Parents created: ${luna.name} & ${simba.name}`);

    // 3. Create Schedules (Now Many-to-Many)
    await prisma.schedule.create({
      data: {
        userId: user.id,
        cats: { connect: [{ id: luna.id }, { id: simba.id }] }, // Shared schedule
        taskName: 'Morning Feeding',
        time: '08:00 AM',
        recurrence: 'Daily'
      }
    });
    
    await prisma.schedule.create({
      data: {
        userId: user.id,
        cats: { connect: [{ id: luna.id }] },
        taskName: 'Flea Prevention',
        time: '09:00 AM',
        recurrence: 'Monthly'
      }
    });
    console.log('📅 Schedules created');

    // 5. Inventory Items
    await prisma.inventoryItem.create({
        data: {
            userId: user.id,
            name: 'Royal Canin Dry Food',
            category: 'Food',
            quantity: 5,
            unit: 'kg',
            threshold: 2,
            cats: { connect: [{ id: luna.id }, { id: simba.id }] }
        }
    });
    
    await prisma.inventoryItem.create({
        data: {
            userId: user.id,
            name: 'Worming Tablets',
            category: 'Medication',
            quantity: 1,
            unit: 'box',
            threshold: 1,
            cats: { connect: [{ id: luna.id }] }
        }
    });
    console.log('📦 Inventory created');

    // 6. Adoption Record
    await prisma.adoptionRecord.create({
      data: {
        catId: luna.id,
        date: new Date('2020-08-01'),
        type: 'Adoption',
        adopterName: 'Beatrice Abadiano',
        notes: 'Adopted from City Shelter. Microchipped.'
      }
    });

    // 7. Litter Record
    await prisma.litter.create({
      data: {
        motherId: luna.id,
        fatherId: simba.id,
        dateOfBirth: new Date('2023-01-10'),
        kittenCount: 2,
        notes: 'First litter. All healthy.'
      }
    });

    console.log('✅ Seed script finished successfully.');
  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    console.log('💡 TIP: Check if your IP is whitelisted on Supabase.');
    (process as any).exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
