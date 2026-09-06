import { defineConfig, devices } from '@playwright/test';

/**
 * Visual-regression config. Storybook stories are the stable test fixtures: the visual spec reads
 * the built Storybook index and screenshots each story's isolated iframe, comparing to committed
 * baselines. Runs against the static build (deterministic, no dev-server variance).
 *
 * Baselines live in `visual/__screenshots__/`. See VISUAL-REGRESSION.md for the coverage,
 * failure criteria, and the approval / baseline-update workflow.
 */
export default defineConfig({
  testDir: './visual',
  snapshotPathTemplate: '{testDir}/__screenshots__/{projectName}/{arg}{ext}',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: process.env.CI ? [['github'], ['html', { open: 'never' }]] : [['list']],
  // KNOWN WEAKNESS — this threshold is too slack to catch a small control changing geometry.
  // Button lost ALL of its vertical padding and every single-button story still passed, because
  // the delta fell under 1% of the image; only the two densest stories failed.
  //
  // It cannot be tightened yet. `.storybook/preview-head.html` pulls Inter, Playfair Display and
  // Material Symbols from Google Fonts over the network with `display=swap`, so glyph rendering
  // depends on network timing and consecutive runs of an UNCHANGED build differ by up to ~8,000
  // pixels (~0.007). Anything below 0.01 turns that nondeterminism into permanent red.
  //
  // Fix the cause first: self-host the three fonts (e.g. @fontsource/inter, @fontsource/
  // playfair-display, material-symbols) so rendering is deterministic and offline-safe, then drop
  // this to ~0.001. That would also settle the intermittent failures in the a11y/interaction
  // runner, which share the same root cause.
  expect: {
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled', caret: 'hide' },
  },
  use: {
    baseURL: 'http://127.0.0.1:6011',
    deviceScaleFactor: 1,
  },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } } },
  ],
  // Serve the already-built Storybook. Build it first: `npm run build -w @envision/storybook`.
  webServer: {
    command: 'npx http-server storybook-static -p 6011 -s -c-1',
    url: 'http://127.0.0.1:6011/index.json',
    reuseExistingServer: !process.env.CI,
    timeout: 60_000,
  },
});
