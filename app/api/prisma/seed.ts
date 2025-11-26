// @ts-ignore
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting seed...');

  // 1. Create User
  const user = await prisma.user.upsert({
    where: { email: 'admin@catly.com' },
    update: {},
    create: {
      email: 'admin@catly.com',
      password: 'password123', // Note: In a real app, ensure this is hashed
      name: 'Beatrice Abadiano',
      phone: '09171234567',
      about: 'Cat lover and breeder.',
    },
  });

  console.log(`👤 User created: ${user.name}`);

  // 2. Create Parent Cats (Dam & Sire)
  const luna = await prisma.cat.create({
    data: {
      ownerId: user.id,
      name: 'Luna',
      breed: 'Siamese',
      gender: 'Female',
      weight: 4.5,
      isSpayed: false,
      isArchived: false,
      photoUrl: 'https://placekitten.com/200/200',
    },
  });

  const simba = await prisma.cat.create({
    data: {
      ownerId: user.id,
      name: 'Simba',
      breed: 'Orange Tabby',
      gender: 'Male',
      weight: 5.2,
      isSpayed: false,
      isArchived: false,
      photoUrl: 'https://placekitten.com/201/201',
    },
  });

  console.log(`🐱 Parents created: ${luna.name} & ${simba.name}`);

  // 3. Create Offspring (linked to parents)
  const nala = await prisma.cat.create({
    data: {
      ownerId: user.id,
      name: 'Nala',
      breed: 'Tabby Mix',
      gender: 'Female',
      weight: 1.2,
      isSpayed: false,
      isArchived: false,
      photoUrl: 'https://placekitten.com/202/202',
      motherId: luna.id,
      fatherId: simba.id,
    },
  });

  console.log(`🐈 Kitten created: ${nala.name} (Child of ${luna.name} & ${simba.name})`);

  // 4. Create Health Events
  await prisma.healthEvent.create({
    data: {
      catId: luna.id,
      title: 'Annual Vaccination',
      eventType: 'Vaccination',
      notes: 'Received FVRCP booster. Next due in 1 year.',
      diagnosis: 'Routine',
      date: new Date(),
    },
  });

  await prisma.healthEvent.create({
    data: {
      catId: nala.id,
      title: 'First Vet Visit',
      eventType: 'Checkup',
      notes: 'Healthy kitten. Deworming started.',
      diagnosis: 'Healthy',
      date: new Date(),
    },
  });

  console.log('✅ Seed script finished successfully.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });