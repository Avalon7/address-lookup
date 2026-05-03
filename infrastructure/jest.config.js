module.exports = {
  testEnvironment: 'node',
  roots: ['<rootDir>/test'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.tsx?$': 'ts-jest'
  },
  // setupFiles runs before the test framework is installed, ensuring
  // SKIP_BUNDLING is set before any CDK constructs are imported.
  setupFiles: ['<rootDir>/test/jest.setup.js'],
  setupFilesAfterEnv: ['aws-cdk-lib/testhelpers/jest-autoclean'],
};
