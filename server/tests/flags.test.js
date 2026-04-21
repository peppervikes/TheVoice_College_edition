const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Review = require('../src/models/Review');
const Course = require('../src/models/Course');
const mongoose = require('mongoose');

describe('Flags Endpoints', () => {
  let userToken;
  let adminToken;
  let dummyReviewId;

  beforeEach(async () => {
    // Normal User (password must be >=6 chars)
    const userRes = await request(app).post('/api/auth/register').send({
      pseudonym: 'User1', email: 'u1@ex.com', password: 'password123'
    });
    userToken = userRes.body.token;

    // Admin User — register, promote in DB, then RE-LOGIN for a fresh JWT with role: admin
    await request(app).post('/api/auth/register').send({
      pseudonym: 'Admin1', email: 'ad@ex.com', password: 'password123'
    });
    await User.updateOne({ email: 'ad@ex.com' }, { role: 'admin' });
    const adminLogin = await request(app).post('/api/auth/login').send({
      email: 'ad@ex.com', password: 'password123'
    });
    adminToken = adminLogin.body.token;

    // Dummy Object & Review
    const uniId = new mongoose.Types.ObjectId();
    const obj = await Course.create({ name: 'Art', code: 'A101', universityId: uniId });
    const user = await User.findOne({ email: 'u1@ex.com' });
    
    const review = await Review.create({
      objectType: 'course', objectId: obj._id, universityId: uniId, userId: user._id,
      reviewText: 'This is a terrible review with bad words.'
    });
    dummyReviewId = review._id;
  });

  it('should allow an authenticated user to flag a review', async () => {
    const res = await request(app)
      .post('/api/flags')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reviewId: dummyReviewId, reason: 'Inappropriate language' });

    expect(res.statusCode).toEqual(201);
    expect(res.body.reasonText).toBe('Inappropriate language');
    expect(res.body.status).toBe('pending');
  });

  it('should prevent unauthenticated users from flagging', async () => {
    const res = await request(app).post('/api/flags').send({ reviewId: dummyReviewId, reason: 'Bad' });
    expect(res.statusCode).toEqual(401);
  });

  it('should allow an admin to retrieve flags', async () => {
    await request(app)
      .post('/api/flags')
      .set('Authorization', `Bearer ${userToken}`)
      .send({ reviewId: dummyReviewId, reason: 'Inappropriate language' });
      
    const res = await request(app)
      .get('/api/flags')
      .set('Authorization', `Bearer ${adminToken}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBeGreaterThan(0);
    expect(res.body[0].reasonText).toBe('Inappropriate language');
    expect(res.body[0].reviewId._id.toString()).toBe(dummyReviewId.toString());
  });

  it('should block non-admins from retrieving flags', async () => {
    const res = await request(app)
      .get('/api/flags')
      .set('Authorization', `Bearer ${userToken}`);

    expect(res.statusCode).toEqual(403);
  });
});
