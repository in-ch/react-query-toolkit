import type { Config } from 'jest';

const config: Config = {
  preset: 'ts-jest',
  testMatch: ['<rootDir>/**/__tests__/**/*.test.[jt]s?(x)'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/'],
  testEnvironment: 'jest-environment-jsdom',
};

module.exports = config;
