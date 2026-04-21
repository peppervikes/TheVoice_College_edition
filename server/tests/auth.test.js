const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');

describe('Auth Endpoints', () => {
  const testUser = {
    pseudonym: 'TestUser123',
    email: 'test@example.com',
    password: 'password123'
  };

  it('should register a new user', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(201);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toEqual(testUser.email);
    expect(res.body.user.pseudonym).toEqual(testUser.pseudonym);

    const userInDb = await User.findOne({ email: testUser.email });
    expect(userInDb).toBeTruthy();
  });

  it('should not register user with duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.statusCode).toEqual(409);
    expect(res.body.error).toContain('account with this email already exists');
  });

  it('should login an existing user', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: testUser.password
      });

    expect(res.statusCode).toEqual(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.user.email).toEqual(testUser.email);
  });

  it('should reject login with wrong password', async () => {
    await request(app).post('/api/auth/register').send(testUser);

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: testUser.email,
        password: 'wrongpassword'
      });

    expect(res.statusCode).toEqual(401);
    expect(res.body.error).toBeDefined();
  });

  it('should fetch authenticated user profile', async () => {
    const loginRes = await request(app).post('/api/auth/register').send(testUser);
    const token = loginRes.body.token;

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.email).toEqual(testUser.email);
  });

  it('should reject unauthenticated request to profile', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.statusCode).toEqual(401);
  });
});
