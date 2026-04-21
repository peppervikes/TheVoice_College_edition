const mongoose = require('mongoose');
const { MongoMemoryServer } = require('mongodb-memory-server');

// Mock environment variables for testing
process.env.JWT_SECRET = 'test_secret_for_jest';
process.env.NODE_ENV = 'test';

let mongoServer;

// Connect to the in-memory database before any tests run
beforeAll(async () => {
  // Disconnect any Mongoose connections just in case
  await mongoose.disconnect();
  
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();
  
  // Connect Mongoose to the memory database
  await mongoose.connect(mongoUri);
});

// Clear all data between tests
afterEach(async () => {
  const collections = mongoose.connection.collections;
  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Clean up after all tests are done
afterAll(async () => {
  if (mongoose.connection !== 0) {
    await mongoose.disconnect();
  }
  if (mongoServer) {
    await mongoServer.stop();
  }
});
