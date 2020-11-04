const preset = require('jest-preset-angular/jest-preset');
module.exports = {
  ...preset,
  preset: 'jest-preset-angular',
  setupFiles: ['jest-canvas-mock'],
  setupFilesAfterEnv: ['<rootDir>/setup-jest.ts'],
  testMatch: ['**/*.spec.ts'],
  moduleNameMapper: {
    '@app/(.*)': '<rootDir>/projects/date-time-range-picker/src/lib/$1',
    '@env': '<rootDir>/src/environments/environment',
    '@src/(.*)': '<rootDir>/projects/date-time-range-picker/src/$1',
  },
  globals: {
    ...preset.globals,
    'ts-jest': {
      // ...preset.globals['ts-jest'],
      tsConfig: '<rootDir>/tsconfig.spec.json',
      isolatedModules: true,
    },
  },
};
