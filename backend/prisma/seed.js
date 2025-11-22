const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // create a standard password for everyone: "Catly123"
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash('Catly123', salt);

  // define dummy users
  const users = [
    {
      email: 'admin@catly.com',
      name: 'Admin User',
      phone: '09170000000',
      about: 'I manage the Catly app.',
      profilePhoto: 'https://i.pravatar.cc/150?img=1',
      passwordHash,
    },
    {
      email: 'juan.delacruz@gmail.com',
      name: 'Juan Dela Cruz',
      phone: '09171234567',
      about: 'Hello! I have 3 persian cats.',
      profilePhoto: 'https://i.pravatar.cc/150?img=11',
      passwordHash,
    },
    {
      email: 'maria.clara@yahoo.com',
      name: 'Maria Clara',
      phone: '09187654321',
      about: 'Looking for a vet near Tacloban.',
      profilePhoto: 'https://i.pravatar.cc/150?img=5',
      passwordHash,
    },
    {
      email: 'test.student@up.edu.ph',
      name: 'Skylar Student',
      phone: '09998887777',
      about: 'CMSC 128 Student testing the app.',
      passwordHash,
    },
  ];

  // loop through and create them
  for (const user of users) {
    const existingUser = await prisma.user.findUnique({
      where: { email: user.email },
    });

    if (!existingUser) {
      await prisma.user.create({
        data: user,
      });
      console.log(`reated user: ${user.email}`);
    } else {
      console.log(`User already exists: ${user.email}`);
    }
  }

  console.log('✨ Seeding completed.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });