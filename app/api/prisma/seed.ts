
import { prisma } from '../src/config/db';
import bcrypt from 'bcryptjs';

async function main() {
  console.log('🌱 Starting seed...');

  try {
    // 1. Create User with Hashed Password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await prisma.user.upsert({
      where: { email: 'admin@catly.com' },
      update: {
        // Force update password and details to ensure they match what we expect
        password: hashedPassword,
        name: 'Beatrice Abadiano',
        phone: '09171234567',
        about: 'Cat lover and breeder. Every day is a purr-fect day to care!',
        // We do not overwrite createdAt, ensuring legacy data stays if needed, 
        // but we ensure auth credentials are fresh.
      },
      create: {
        email: 'admin@catly.com',
        password: hashedPassword,
        name: 'Beatrice Abadiano',
        phone: '09171234567',
        about: 'Cat lover and breeder. Every day is a purr-fect day to care!',
      },
    });

    console.log(`👤 User synced: ${user.name} (Password: password123)`);

    // 2. Create Contacts (RTM 40)
    await prisma.contact.create({
      data: {
        ownerId: user.id,
        name: 'Dr. Smith (Vet)',
        role: 'Veterinarian',
        phone: '555-0123',
        email: 'dr.smith@vetclinic.com'
      }
    });
    console.log('📞 Contacts created');

    // 3. Create Schedules (RTM 30)
    await prisma.schedule.create({
      data: {
        userId: user.id,
        taskName: 'Morning Feeding',
        time: '08:00 AM',
        recurrence: 'Daily'
      }
    });
    await prisma.schedule.create({
      data: {
        userId: user.id,
        taskName: 'Flea Prevention',
        time: '09:00 AM',
        recurrence: 'Monthly'
      }
    });
    console.log('📅 Schedules created');

    // 4. Create Parent Cats (Dam & Sire)
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

    // 5. Adoption Record (RTM 37)
    await prisma.adoptionRecord.create({
      data: {
        catId: luna.id,
        date: new Date('2020-08-01'),
        type: 'Adoption',
        adopterName: 'Beatrice Abadiano',
        notes: 'Adopted from City Shelter. Microchipped.'
      }
    });
    console.log('🏠 Adoption record created');

    // 6. Litter Record (RTM 23)
    await prisma.litter.create({
      data: {
        motherId: luna.id,
        fatherId: simba.id,
        dateOfBirth: new Date('2023-01-10'),
        kittenCount: 2,
        notes: 'First litter. All healthy.'
      }
    });
    console.log('🐈 Litter record created');

    // 7. Create Offspring (linked to parents)
    const nala = await prisma.cat.create({
      data: {
        ownerId: user.id,
        name: 'Nala',
        nickname: 'Nana',
        breed: 'Tabby Mix',
        gender: 'Female',
        weight: 3.2,
        birthDate: new Date('2023-01-10'),
        color: 'Calico',
        eyeColor: 'Yellow',
        features: 'White paws, very playful',
        isSpayed: true,
        isArchived: false,
        photoUrl: 'https://placekitten.com/202/202',
        motherId: luna.id,
        fatherId: simba.id,
      },
    });

    const tiger = await prisma.cat.create({
      data: {
        ownerId: user.id,
        name: 'Tiger',
        nickname: 'Tiggy',
        breed: 'Tabby Mix',
        gender: 'Male',
        weight: 3.5,
        birthDate: new Date('2023-01-10'),
        color: 'Grey Tabby',
        eyeColor: 'Green',
        features: 'Stripes all over',
        isSpayed: true,
        isArchived: false,
        photoUrl: 'https://placekitten.com/203/203',
        motherId: luna.id,
        fatherId: simba.id,
      },
    });

    console.log(`🍼 Kittens created: ${nala.name} & ${tiger.name}`);

    // 8. Create Health Events
    await prisma.healthEvent.create({
      data: {
        catId: luna.id,
        title: 'Annual Vaccination',
        eventType: 'Vaccination',
        notes: 'Received FVRCP booster. Next due in 1 year.',
        diagnosis: 'Routine',
        date: new Date('2023-05-15'),
      },
    });

    await prisma.healthEvent.create({
      data: {
        catId: nala.id,
        title: 'Spay Surgery',
        eventType: 'Surgery',
        notes: 'Surgery went well. Recovered in 2 days.',
        diagnosis: 'Healthy',
        date: new Date('2023-07-20'),
      },
    });

    console.log('✅ Seed script finished successfully.');
  } catch (error) {
    console.error('❌ Seed failed:', error);
    (process as any).exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
