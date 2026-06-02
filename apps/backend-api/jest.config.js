// Location: apps/backend-api/jest.config.js

/** @type {import('jest').Config} */
module.exports = {
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: '.',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['src/**/*.(t|j)s'],
  coverageDirectory: './coverage',
  testEnvironment: 'node',
  
  // 🛡️ Explicit Monorepo Module Aliasing
  moduleNameMapper: {
    '^src/(.*)$': '<rootDir>/src/$1',
    '^@chronos/database$': '<rootDir>/../../packages/database/src',
    '^@chronos/types-common$': '<rootDir>/../../packages/types-common/src'
  },
};