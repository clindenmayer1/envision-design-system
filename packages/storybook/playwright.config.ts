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
  // Fail on any perceptible pixel change; anti-aliasing tolerance keeps false positives out.
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
