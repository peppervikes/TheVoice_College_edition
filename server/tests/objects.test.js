const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const mongoose = require('mongoose');

describe('Objects Endpoints', () => {
  let adminToken;
  let normalToken;

  beforeEach(async () => {
    // Normal user
    const userRes = await request(app).post('/api/auth/register').send({
      pseudonym: 'Student', email: 'student@example.com', password: 'password123'
    });
    normalToken = userRes.body.token;

    // Admin user — register, then promote in DB, then RE-LOGIN to get a fresh JWT with role: admin
    await request(app).post('/api/auth/register').send({
      pseudonym: 'AdminUser', email: 'admin@example.com', password: 'password123'
    });
    await User.updateOne({ email: 'admin@example.com' }, { role: 'admin' });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'admin@example.com', password: 'password123'
    });
    adminToken = adminLogin.body.token;
  });

  it('should not allow creating an object if not an admin', async () => {
    const uniId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/admin/object')
      .set('Authorization', `Bearer ${normalToken}`)
      .send({ type: 'course', data: { name: 'Math 101', universityId: uniId.toString() } });

    expect(res.statusCode).toEqual(403);
  });

  it('should allow an admin to create an object', async () => {
    const uniId = new mongoose.Types.ObjectId();
    const res = await request(app)
      .post('/api/admin/object')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ type: 'course', data: { name: 'Math 101', code: 'MTH101', universityId: uniId.toString() } });

    expect(res.statusCode).toEqual(201);
    expect(res.body.name).toBe('Math 101');
  });

  it('should allow searching objects by name', async () => {
    const uniId = new mongoose.Types.ObjectId();
    await Course.create({ name: 'Biology', code: 'BIO101', universityId: uniId });

    const res = await request(app).get(`/api/search?universityId=${uniId.toString()}&type=course&q=bio`);
    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].code).toBe('BIO101');
  });
});
