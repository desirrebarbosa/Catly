describe('Cat Management Tests', () => {
  let authToken;
  let userId;
  let catId;
  let secondToken;

  // Setup: Create test user
  beforeAll(async () => {
    // Create first user
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send(testUser2);

    authToken = signupResponse.body.token;
    userId = signupResponse.body.user.id;

    // Create second user for isolation tests
    const signup2Response = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'otheruser@test.com',
        password: 'OtherPass123',
        name: 'Other User'
      });

    secondToken = signup2Response.body.token;
  });

  describe('POST /api/cats', () => {
    test('Should create a new cat', async () => {
      const catData = {
        name: 'Whiskers',
        breed: 'Persian',
        gender: 'Male',
        birthdate: '2022-01-15',
        color: 'Orange Tabby',
        weight: 4.5,
        notes: 'Very friendly cat'
      };

      const response = await request(app)
        .post('/api/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send(catData)
        .expect(201);

      expect(response.body).toHaveProperty('message', 'Cat created successfully');
      expect(response.body).toHaveProperty('cat');
      expect(response.body.cat.name).toBe(catData.name);
      expect(response.body.cat.breed).toBe(catData.breed);
      expect(response.body.cat.gender).toBe(catData.gender);
      expect(response.body.cat.color).toBe(catData.color);
      expect(response.body.cat.weight).toBe(catData.weight);

      // Save cat ID for later tests
      catId = response.body.cat.id;
    });

    test('Should create cat with minimal data (only name)', async () => {
      const response = await request(app)
        .post('/api/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Luna' })
        .expect(201);

      expect(response.body.cat.name).toBe('Luna');
    });

    test('Should not create cat without name', async () => {
      const response = await request(app)
        .post('/api/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ breed: 'Siamese' })
        .expect(400);

      expect(response.body).toHaveProperty('error', 'Cat name is required');
    });

    test('Should not create cat without authentication', async () => {
      const response = await request(app)
        .post('/api/cats')
        .send({ name: 'Unauthorized Cat' })
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });
  });

  describe('GET /api/cats', () => {
    test('Should get all cats for authenticated user', async () => {
      const response = await request(app)
        .get('/api/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cats');
      expect(Array.isArray(response.body.cats)).toBe(true);
      expect(response.body.cats.length).toBeGreaterThan(0);
    });

    test('Should filter cats by name', async () => {
      const response = await request(app)
        .get('/api/cats?search=Whiskers')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body.cats.length).toBeGreaterThan(0);
      expect(response.body.cats[0].name).toContain('Whiskers');
    });

    test('Should not get cats without authentication', async () => {
      const response = await request(app)
        .get('/api/cats')
        .expect(401);

      expect(response.body).toHaveProperty('error');
    });

    test('Should only return cats for the authenticated user', async () => {
      const response = await request(app)
        .get('/api/cats')
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(200);

      // Second user should have no cats
      expect(response.body.cats.length).toBe(0);
    });
  });

  describe('GET /api/cats/:id', () => {
    test('Should get a single cat by ID', async () => {
      const response = await request(app)
        .get(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('cat');
      expect(response.body.cat.id).toBe(catId);
      expect(response.body.cat.name).toBe('Whiskers');
    });

    test('Should return 404 for non-existent cat', async () => {
      const fakeId = '550e8400-e29b-41d4-a716-446655440000';
      const response = await request(app)
        .get(`/api/cats/${fakeId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Cat not found');
    });

    test('Should not allow access to other user\'s cat', async () => {
      const response = await request(app)
        .get(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Cat not found');
    });
  });

  describe('PUT /api/cats/:id', () => {
    test('Should update cat details', async () => {
      const updateData = {
        name: 'Whiskers Updated',
        weight: 5.0,
        notes: 'Updated notes'
      };

      const response = await request(app)
        .put(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cat updated successfully');
      expect(response.body.cat.name).toBe(updateData.name);
      expect(response.body.cat.weight).toBe(updateData.weight);
      expect(response.body.cat.notes).toBe(updateData.notes);
    });

    test('Should not update other user\'s cat', async () => {
      const response = await request(app)
        .put(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .send({ name: 'Hacked Name' })
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Cat not found');
    });
  });

  describe('PATCH /api/cats/:id/archive', () => {
    test('Should archive a cat', async () => {
      const response = await request(app)
        .patch(`/api/cats/${catId}/archive`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cat archived successfully');

      // Verify cat is archived
      const getCatResponse = await request(app)
        .get(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getCatResponse.body.cat.isArchived).toBe(true);
    });

    test('Should not show archived cats in default list', async () => {
      const response = await request(app)
        .get('/api/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const archivedCat = response.body.cats.find(cat => cat.id === catId);
      expect(archivedCat).toBeUndefined();
    });

    test('Should show archived cats when requested', async () => {
      const response = await request(app)
        .get('/api/cats?includeArchived=true')
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      const archivedCat = response.body.cats.find(cat => cat.id === catId);
      expect(archivedCat).toBeDefined();
      expect(archivedCat.isArchived).toBe(true);
    });
  });

  describe('PATCH /api/cats/:id/restore', () => {
    test('Should restore an archived cat', async () => {
      const response = await request(app)
        .patch(`/api/cats/${catId}/restore`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cat restored successfully');

      // Verify cat is restored
      const getCatResponse = await request(app)
        .get(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(getCatResponse.body.cat.isArchived).toBe(false);
    });
  });

  describe('DELETE /api/cats/:id', () => {
    test('Should delete a cat', async () => {
      const response = await request(app)
        .delete(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('message', 'Cat deleted successfully');

      // Verify cat is deleted
      const getCatResponse = await request(app)
        .get(`/api/cats/${catId}`)
        .set('Authorization', `Bearer ${authToken}`)
        .expect(404);
    });

    test('Should not delete other user\'s cat', async () => {
      // Create a cat first
      const createResponse = await request(app)
        .post('/api/cats')
        .set('Authorization', `Bearer ${authToken}`)
        .send({ name: 'Protected Cat' });

      const protectedCatId = createResponse.body.cat.id;

      // Try to delete with different user
      const response = await request(app)
        .delete(`/api/cats/${protectedCatId}`)
        .set('Authorization', `Bearer ${secondToken}`)
        .expect(404);

      expect(response.body).toHaveProperty('error', 'Cat not found');
    });
  });
});