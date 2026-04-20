module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  clearMocks: true,
  silent: false,
  setupFilesAfterEnv: ['./tests/setup.js'] // We'll create this file next to handle the in-memory db
};
