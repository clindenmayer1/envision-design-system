// Flat ESLint config for the Envision monorepo.
// Enforced on packages/*; the app (src/**) is linted too but has pre-existing debt
// being burned down, so its noisy rules are warnings rather than errors for now.
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: [
      '**/dist/**',
      '**/build/**',
      '**/node_modules/**',
      '**/storybook-static/**', // Storybook build output
      '**/playwright-report/**',
      '**/test-results/**',
      '**/__screenshots__/**', // visual-regression baselines
      '_*.mjs', // root three.js/GLB experiment scratch files
      'scripts/**',
      'packages/design-system/fixtures/**',
      'packages/tokens/src/*.tokens.json',
    ],
  },
  ...tseslint.configs.recommended,
  {
    files: ['**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-unused-vars': ['warn', { argsIgnorePattern: '^_' }],
      '@typescript-eslint/no-explicit-any': 'warn',
    },
  },
  {
    // App code has pre-existing debt; keep it visible (warn) without blocking CI yet.
    files: ['src/**/*.{ts,tsx}'],
    rules: {
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/ban-ts-comment': 'warn',
    },
  },
);
