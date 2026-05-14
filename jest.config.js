const nextJest = require('next/jest')

const createJestConfig = nextJest({ dir: './' })

/** @type {import('jest').Config} */
const config = {
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/$1',
  },
  collectCoverageFrom: [
    'store/**/*.ts',
    'services/orders.ts',
    'components/ThemeProvider.tsx',
    'components/SearchModal.tsx',
    'components/ProductCard.tsx',
    'components/CartDrawer.tsx',
  ],
  coverageThreshold: {
    global: {
      lines: 70,
      functions: 70,
      branches: 60,
    },
  },
  coverageProvider: 'v8',
}

module.exports = createJestConfig(config)
