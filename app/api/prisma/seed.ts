
import { prisma } from '../src/config/db';
import bcrypt from 'bcryptjs';

async function createUser(email: string, name: string, about: string, pass: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(pass, salt);
    
    return await prisma.user.upsert({
        where: { email },
        update: { password: hashedPassword, name, about },
        create: { email, password: hashedPassword, name, about },
    });
}

async function main() {
  console.log('🌱 Starting comprehensive seed...');

  try {
    // ==========================================
    // 1. BEATRICE (The Breeder)
    // ==========================================
    console.log('👤 Creating Beatrice (Breeder)...');
    const beatrice = await createUser('beatrice@catly.com', 'Beatrice Abadiano', 'Registered Siamese Breeder. Focused on lineage and health.', 'Password123');

    // Cats
    const luna = await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Luna', breed: 'Siamese', gender: 'Female', weight: 4.5,
            birthDate: new Date('2020-05-15'), color: 'Cream Point', eyeColor: 'Blue',
            features: 'Show quality, very vocal',
            photoUrl: 'https://placekitten.com/200/200'
        }
    });
    const simba = await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Simba', breed: 'Siamese', gender: 'Male', weight: 5.2,
            birthDate: new Date('2019-08-20'), color: 'Seal Point', eyeColor: 'Deep Blue',
            features: 'Strong build, Sire of 3 litters',
            photoUrl: 'https://placekitten.com/201/201'
        }
    });

    // Litter
    const litter = await prisma.litter.create({
        data: {
            motherId: luna.id, fatherId: simba.id,
            dateOfBirth: new Date('2023-01-10'), kittenCount: 3,
            notes: 'First litter. 2 Females, 1 Male.'
        }
    });

    // Kitten (Child)
    const kitten = await prisma.cat.create({
        data: {
            ownerId: beatrice.id,
            name: 'Nala', breed: 'Siamese', gender: 'Female', weight: 1.2,
            birthDate: new Date('2023-01-10'),
            motherId: luna.id, fatherId: simba.id, litterId: litter.id,
            photoUrl: 'https://placekitten.com/100/100'
        }
    });

    // Contacts
    const vet = await prisma.contact.create({
        data: { ownerId: beatrice.id, name: 'Dr. Smith', role: 'Veterinarian', phone: '555-0199' }
    });
    const buyer = await prisma.contact.create({
        data: { ownerId: beatrice.id, name: 'Alice Buyer', role: 'Other', phone: '555-9988' }
    });

    // Adoption (Sold a kitten)
    await prisma.adoptionRecord.create({
        data: {
            catId: luna.id, // Just linking record, usually would be a sold kitten
            date: new Date('2023-04-20'), type: 'Transfer',
            contactId: buyer.id, adopterName: buyer.name, notes: 'Deposit paid.'
        }
    });

    // Schedule
    await prisma.schedule.create({
        data: {
            userId: beatrice.id,
            cats: { connect: [{ id: luna.id }, { id: simba.id }, { id: kitten.id }] },
            taskName: 'Vaccination', time: '09:00 AM', recurrence: 'Once'
        }
    });

    // ==========================================
    // 2. JOHN (Casual Owner)
    // ==========================================
    console.log('👤 Creating John (Casual Owner)...');
    const john = await createUser('john@catly.com', 'John Doe', 'Just love my two tabbies!', 'Password123');

    const garfield = await prisma.cat.create({
        data: {
            ownerId: john.id, name: 'Garfield', breed: 'Tabby', gender: 'Male', weight: 8.5,
            birthDate: new Date('2018-01-01'), color: 'Orange',
            photoUrl: 'https://placekitten.com/202/202'
        }
    });

    // Simple Feeding Schedule
    await prisma.schedule.create({
        data: {
            userId: john.id, cats: { connect: [{ id: garfield.id }] },
            taskName: 'Feeding', time: '05:00 PM', recurrence: 'Daily'
        }
    });

    // Inventory
    await prisma.inventoryItem.create({
        data: {
            userId: john.id, name: 'Dry Food', category: 'Food', quantity: 2, unit: 'bags',
            cats: { connect: [{ id: garfield.id }] }
        }
    });

    // ==========================================
    // 3. SARAH (Foster Parent)
    // ==========================================
    console.log('👤 Creating Sarah (Foster)...');
    const sarah = await createUser('sarah@catly.com', 'Sarah Foster', 'Fostering kittens for City Shelter.', 'Password123');

    const lucky = await prisma.cat.create({
        data: {
            ownerId: sarah.id, name: 'Lucky', breed: 'DSH', gender: 'Male', weight: 3.0,
            birthDate: new Date('2022-06-01'), isArchived: true, // Archived because adopted out
            photoUrl: 'https://placekitten.com/203/203'
        }
    });

    const tiny = await prisma.cat.create({
        data: {
            ownerId: sarah.id, name: 'Tiny', breed: 'DSH', gender: 'Female', weight: 0.5,
            birthDate: new Date('2024-01-01'),
            photoUrl: 'https://placekitten.com/204/204'
        }
    });

    // Health Event (Sick Cat)
    await prisma.healthEvent.create({
        data: {
            catId: tiny.id, title: 'Eye Infection', eventType: 'Illness',
            diagnosis: 'Conjunctivitis', notes: 'Applying ointment 2x daily.',
            date: new Date()
        }
    });

    // Meds Inventory
    await prisma.inventoryItem.create({
        data: {
            userId: sarah.id, name: 'Eye Ointment', category: 'Medication', quantity: 1, unit: 'tube',
            cats: { connect: [{ id: tiny.id }] }
        }
    });

    console.log('✅ Comprehensive seed finished.');
    console.log('🔑 Logins: beatrice@catly.com, john@catly.com, sarah@catly.com (Pass: Password123)');

  } catch (error: any) {
    console.error('❌ Seed failed:', error.message);
    (process as any).exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
