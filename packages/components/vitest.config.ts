import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    // happy-dom gives us custom elements, Shadow DOM, constructable stylesheets,
    // and (partial) ElementInternals — enough to test the observable component
    // contract. Browser-only concerns (:focus-visible painting, forced-colors) are
    // covered by the staged Playwright layer, noted in each component's doc.
    environment: 'happy-dom',
    include: ['src/**/*.test.ts'],
    globals: false,
  },
});
