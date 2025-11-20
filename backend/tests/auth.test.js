const request = require('supertest');
const { PrismaClient } = require('@prisma/client');
const app = require('../server'); // Your Express app

const prisma = new PrismaClient();

// Test data
const testUser = {
  email: 'test@catly.com',
  password: 'TestPass123',
  name: 'Test User'
};

const testUser2 = {
  email: 'test2@catly.com',
  password: 'TestPass456',
  name: 'Test User 2'
};

// Clean up database before and after tests
beforeAll(async () => {
  // Clear all data
  await prisma.adoptionRecord.deleteMany();
  await prisma.healthEvent.deleteMany();
  await prisma.litter.deleteMany();
  await prisma.cat.deleteMany();
  await prisma.schedule.deleteMany();
  await prisma.contact.deleteMany();
  await prisma.user.deleteMany();
});

afterAll(async () => {
  // Clean up and disconnect
  await prisma.$disconnect();
});

describe('Authentication Tests', () => {
  let authToken;
  let userId;

  describe('POST /api/auth/signup', () => {
    test('Should create a new user account', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Account created successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.user.name).toBe(testUser.name);

      // Save for later tests
      authToken = response.body.token;
      userId = response.body.user.id;
    });

    test('Should not create user with existing email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send(testUser)
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Email already registered');
    });

    test('Should not create user with invalid email', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'invalid-email',
          password: 'TestPass123',
          name: 'Test'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('Should not create user with weak password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'weak@test.com',
          password: 'weak',
          name: 'Test'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('Should not create user without uppercase in password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'nouppercase@test.com',
          password: 'testpass123',
          name: 'Test'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('Should not create user without number in password', async () => {
      const response = await request(app)
        .post('/api/auth/signup')
        .send({
          email: 'nonumber@test.com',
          password: 'TestPassword',
          name: 'Test'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('POST /api/auth/login', () => {
    test('Should log in with valid credentials', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: testUser.password
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged in successfully');
      expect(response.body).toHaveProperty('user');
      expect(response.body).toHaveProperty('token');
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
    });

    test('Should not log in with wrong password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email,
          password: 'WrongPassword123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    test('Should not log in with non-existent email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: 'TestPass123'
        })
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid email or password');
    });

    test('Should not log in without email', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          password: 'TestPass123'
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });

    test('Should not log in without password', async () => {
      const response = await request(app)
        .post('/api/auth/login')
        .send({
          email: testUser.email
        })
        .expect(400);

      expect(response.body).toHaveProperty('errors');
    });
  });

  describe('GET /api/auth/profile', () => {
    test('Should get user profile with valid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('user');
      expect(response.body.user.email).toBe(testUser.email.toLowerCase());
      expect(response.body.user.name).toBe(testUser.name);
    });

    test('Should not get profile without token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'No token provided');
    });

    test('Should not get profile with invalid token', async () => {
      const response = await request(app)
        .get('/api/auth/profile')
        .set('Authorization', 'Bearer invalid-token')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'Invalid or expired token');
    });
  });

  describe('PUT /api/auth/profile', () => {
    test('Should update user profile', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .set('Authorization', `Bearer ${authToken}`)
        .send({
          name: 'Updated Name',
          phone: '+1234567890'
        })
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Profile updated successfully');
      expect(response.body.user.name).toBe('Updated Name');
      expect(response.body.user.phone).toBe('+1234567890');
    });

    test('Should not update profile without token', async () => {
      const response = await request(app)
        .put('/api/auth/profile')
        .send({ name: 'Test' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('POST /api/auth/logout', () => {
    test('Should log out successfully', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Logged out successfully');
    });

    test('Should not log out without token', async () => {
      const response = await request(app)
        .post('/api/auth/logout')
        .expect(401);

      expect(response.body).toHaveProperty('error', 'No token provided');
    });
  });

  describe('POST /api/auth/password-reset', () => {
    test('Should accept password reset request', async () => {
      const response = await request(app)
        .post('/api/auth/password-reset')
        .send({ email: testUser.email })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });

    test('Should accept reset for non-existent email (security)', async () => {
      const response = await request(app)
        .post('/api/auth/password-reset')
        .send({ email: 'nonexistent@test.com' })
        .expect(200);

      expect(response.body).toHaveProperty('message');
    });
  });
});
