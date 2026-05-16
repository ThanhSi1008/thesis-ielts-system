import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  testRegex: '.*\\.spec\\.ts$',
  transform: {
    '^.+\\.(t|j)s$': 'ts-jest',
  },
  collectCoverageFrom: ['**/*.(t|j)s'],
  coverageDirectory: '../coverage',
  moduleNameMapper: {
    '^@modules/(.*)$': '<rootDir>/modules/$1',
    '^@common/(.*)$': '<rootDir>/common/$1',
    '^@config/(.*)$': '<rootDir>/config/$1',
  },
  reporters: [
    'default',
    [
      '<rootDir>/../test/reporters/markdown-reporter.js',
      {
        outputPath: '../../docs/testing/test-results.md',
        title: 'Báo cáo kết quả kiểm thử backend-core (auto-generated)',
        author: 'Auto (Jest)',
      },
    ],
    [
      'jest-junit',
      {
        outputDirectory: '<rootDir>/..',
        outputName: 'junit.xml',
        suiteName: 'backend-core unit tests',
        classNameTemplate: '{filepath}',
        titleTemplate: '{title}',
        ancestorSeparator: ' › ',
      },
    ],
  ],
};

export default config;
