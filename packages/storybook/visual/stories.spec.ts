import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

/**
 * One visual test per Storybook STORY (docs pages are excluded — they're prose, not fixtures).
 * A story opts out of visual coverage with `tags: ['no-visual']` (used for intentionally dynamic
 * or interaction-only stories). The Storybook index is read from the static build.
 */
interface IndexEntry { id: string; title: string; name: string; type: 'story' | 'docs'; tags?: string[]; }
const indexPath = fileURLToPath(new URL('../storybook-static/index.json', import.meta.url));
const index = JSON.parse(readFileSync(indexPath, 'utf8')) as { entries: Record<string, IndexEntry> };
const stories = Object.values(index.entries).filter(
  (e) => e.type === 'story' && !(e.tags ?? []).includes('no-visual'),
);

for (const story of stories) {
  test(`${story.title} — ${story.name}`, async ({ page }) => {
    await page.goto(`/iframe.html?id=${story.id}&viewMode=story`);
    await page.waitForSelector('#storybook-root', { state: 'attached' });
    // Wait for fonts + any play function to settle so the frame is stable.
    await page.evaluate(() => (document as Document & { fonts: FontFaceSet }).fonts.ready);
    await page.waitForTimeout(300);
    await expect(page).toHaveScreenshot(`${story.id}.png`, { fullPage: true });
  });
}
