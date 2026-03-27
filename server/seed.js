require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const User = require('./src/models/User');
const University = require('./src/models/University');
const Course = require('./src/models/Course');
const Professor = require('./src/models/Professor');
const TeachingAssistant = require('./src/models/TeachingAssistant');
const Review = require('./src/models/Review');
const Flag = require('./src/models/Flag');

const MONGODB_URI = process.env.MONGO_URI;

if (!MONGODB_URI || MONGODB_URI === 'your_mongodb_connection_string') {
  console.error("ERROR: Please set a valid MONGO_URI in your server/.env file before running the seed script.");
  console.error("If you don't have one, create a free cluster at https://account.mongodb.com/");
  process.exit(1);
}

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB for seeding...');

    // Clear existing data
    await User.deleteMany({});
    await University.deleteMany({});
    await Course.deleteMany({});
    await Professor.deleteMany({});
    await TeachingAssistant.deleteMany({});
    await Review.deleteMany({});
    await Flag.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Users
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminUser = await User.create({
      email: 'admin@uni-review.com',
      authProvider: 'local',
      passwordHash: hashedPassword,
      pseudonym: 'AdminUser',
      role: 'admin'
    });

    const studentUser = await User.create({
      email: 'student@uni-review.com',
      authProvider: 'google',
      providerId: 'google-12345',
      pseudonym: 'NerdStudent99',
      role: 'user'
    });
    console.log('Users created.');

    // 2. Create Universities
    const uni1 = await University.create({ name: 'Massachusetts Institute of Technology (MIT)', country: 'USA', domain: 'mit.edu' });
    const uni2 = await University.create({ name: 'Stanford University', country: 'USA', domain: 'stanford.edu' });
    console.log('Universities created.');

    // 3. Create Courses
    const cs101 = await Course.create({ universityId: uni1._id, code: 'CS101', name: 'Introduction to Computer Science', isOnline: false, createdBy: 'admin' });
    const math101 = await Course.create({ universityId: uni2._id, code: 'MATH101', name: 'Calculus I', isOnline: true, createdBy: 'admin' });
    console.log('Courses created.');

    // 4. Create Professors
    const prof1 = await Professor.create({ universityId: uni1._id, name: 'Dr. John Doe', courses: [cs101._id] });
    const prof2 = await Professor.create({ universityId: uni2._id, name: 'Dr. Jane Smith', courses: [math101._id] });
    console.log('Professors created.');

    // 5. Create TAs
    const ta1 = await TeachingAssistant.create({ universityId: uni1._id, name: 'Alice Johnson', courses: [cs101._id] });
    console.log('TAs created.');

    // 6. Create Reviews
    await Review.create({
      objectType: 'course',
      objectId: cs101._id,
      universityId: uni1._id,
      userId: studentUser._id,
      anonymous: true,
      ratings: { difficulty: 4, wouldTakeAgain: true, assignmentDifficulty: 3, examType: 'offline', examStyle: 'both' },
      tags: ['Heavy workload', 'Great lectures'],
      textbookUsed: true,
      attendanceMandatory: false,
      grade: 'A',
      reviewText: 'Tough but very rewarding class. Highly recommend starting assignments early.',
      likes: 5
    });

    await Review.create({
      objectType: 'professor',
      objectId: prof1._id,
      universityId: uni1._id,
      userId: studentUser._id,
      anonymous: false,
      ratings: { difficulty: 3, wouldTakeAgain: true },
      tags: ['Caring', 'Respected'],
      reviewText: 'Dr. Doe really cares about the students. Office hours are extremely helpful.',
      likes: 12
    });
    console.log('Reviews created.');

    console.log('Database seeded successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();
