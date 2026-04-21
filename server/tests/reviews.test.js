const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/User');
const Course = require('../src/models/Course');
const mongoose = require('mongoose');

describe('Reviews Endpoints', () => {
  let token;
  let testUser;
  let testObject;

  beforeEach(async () => {
    // 1. Create a user and get token
    const userRes = await request(app).post('/api/auth/register').send({
      pseudonym: 'Reviewer123',
      email: 'reviewer@example.com',
      password: 'password123'
    });
    token = userRes.body.token;
    testUser = await User.findOne({ email: 'reviewer@example.com' });

    // 2. Create a fake object to review
    testObject = await Course.create({
      name: 'Intro to Testing',
      code: 'TEST101',
      universityId: new mongoose.Types.ObjectId(),
      createdBy: testUser._id
    });
  });

  it('should allow an authenticated user to create a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        objectType: 'course',
        objectId: testObject._id,
        universityId: testObject.universityId,
        textReview: 'Great course, highly recommend!',
        ratings: { difficulty: 3, wouldTakeAgain: true }
      });

    expect(res.statusCode).toEqual(201);
    expect(res.body.reviewText).toBe('Great course, highly recommend!');
    expect(res.body.userId).toBe(testUser._id.toString());
  });

  it('should block unauthenticated users from creating a review', async () => {
    const res = await request(app)
      .post('/api/reviews')
      .send({
        objectType: 'course',
        objectId: testObject._id,
        textReview: 'Nice fake review'
      });

    expect(res.statusCode).toEqual(401);
  });

  it('should block users from reviewing the same object twice', async () => {
    // First review
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        objectType: 'course',
        objectId: testObject._id,
        universityId: testObject.universityId,
        textReview: 'First one'
      });

    // Second review on same object
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        objectType: 'course',
        objectId: testObject._id,
        universityId: testObject.universityId,
        textReview: 'Second one'
      });

    expect(res.statusCode).toEqual(400);
    expect(res.body.error).toContain('already reviewed');
  });

  it('should allow user to fetch their own reviews', async () => {
    await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${token}`)
      .send({
        objectType: 'course',
        objectId: testObject._id,
        universityId: testObject.universityId,
        textReview: 'My own review'
      });

    const res = await request(app)
      .get('/api/reviews/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.statusCode).toEqual(200);
    expect(res.body.length).toBe(1);
    expect(res.body[0].reviewText).toBe('My own review');
  });
});
