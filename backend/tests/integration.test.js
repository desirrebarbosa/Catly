describe('Integration Tests - Complete User Workflow', () => {
  let token;
  let catId;

  test('Complete user journey: Signup → Login → Create Cat → Update Cat → Archive', async () => {
    // Step 1: Sign up
    const signupResponse = await request(app)
      .post('/api/auth/signup')
      .send({
        email: 'journey@test.com',
        password: 'JourneyPass123',
        name: 'Journey User'
      })
      .expect(201);

    expect(signupResponse.body).toHaveProperty('token');
    token = signupResponse.body.token;

    // Step 2: Get profile
    const profileResponse = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(profileResponse.body.user.email).toBe('journey@test.com');

    // Step 3: Create a cat
    const createCatResponse = await request(app)
      .post('/api/cats')
      .set('Authorization', `Bearer ${token}`)
      .send({
        name: 'Journey Cat',
        breed: 'British Shorthair',
        gender: 'Female'
      })
      .expect(201);

    catId = createCatResponse.body.cat.id;
    expect(createCatResponse.body.cat.name).toBe('Journey Cat');

    // Step 4: Get all cats
    const getAllCatsResponse = await request(app)
      .get('/api/cats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getAllCatsResponse.body.cats.length).toBe(1);

    // Step 5: Update the cat
    const updateCatResponse = await request(app)
      .put(`/api/cats/${catId}`)
      .set('Authorization', `Bearer ${token}`)
      .send({ weight: 3.8 })
      .expect(200);

    expect(updateCatResponse.body.cat.weight).toBe(3.8);

    // Step 6: Archive the cat
    await request(app)
      .patch(`/api/cats/${catId}/archive`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Step 7: Verify cat is not in default list
    const getAfterArchiveResponse = await request(app)
      .get('/api/cats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(getAfterArchiveResponse.body.cats.length).toBe(0);

    // Step 8: Restore the cat
    await request(app)
      .patch(`/api/cats/${catId}/restore`)
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    // Step 9: Verify cat is back in list
    const finalGetResponse = await request(app)
      .get('/api/cats')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(finalGetResponse.body.cats.length).toBe(1);

    // Step 10: Log out
    await request(app)
      .post('/api/auth/logout')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });
});