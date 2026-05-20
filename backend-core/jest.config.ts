import type { Config } from 'jest';

const config: Config = {
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'json', 'ts'],
  rootDir: 'src',
  roots: ['<rootDir>', '../test'],
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

  // ─── Coverage gates ────────────────────────────────────────────────────
  // Per-file thresholds cho các service cốt lõi. Jest sẽ fail nếu coverage
  // thấp hơn ngưỡng sau khi chạy `npm run test:coverage`.
  //
  // Path key phải là glob tương đối với rootDir (src/).
  // Tài liệu: https://jestjs.io/docs/configuration#coveragethreshold-object
  // ──────────────────────────────────────────────────────────────────────
  coverageThreshold: {
    // Global fallback — toàn project phải đạt tối thiểu đây
    global: {
      lines: 28,
      branches: 14,
    },

    // Auth service — xác thực & phân quyền, priority cao
    './src/modules/auth/auth.service.ts': {
      lines: 70,
      branches: 60,
    },

    // Subscriptions service — billing logic
    './src/modules/subscriptions/subscriptions.service.ts': {
      lines: 50,
      branches: 30,
    },

    // Gamification service — điểm thưởng / badge
    './src/modules/gamification/gamification.service.ts': {
      lines: 30,
      branches: 10,
    },
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
