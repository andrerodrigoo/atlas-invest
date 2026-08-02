/** @type {import('jest').Config} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  moduleNameMapper: {
    "^@api/(.*)$": "<rootDir>/src/api/$1",
    "^@application/(.*)$": "<rootDir>/src/application/$1",
    "^@domain/(.*)$": "<rootDir>/src/domain/$1",
    "^@infrastructure/(.*)$": "<rootDir>/src/infrastructure/$1",
    "^@config/(.*)$": "<rootDir>/src/config/$1",
  },
  testMatch: ["**/tests/**/*.test.ts"],
  setupFiles: ["<rootDir>/tests/jest.setup.ts"],
};
