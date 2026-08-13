import type { TestRunnerConfig } from '@storybook/test-runner';
import { getStoryContext } from '@storybook/test-runner';
import AxeBuilder from '@axe-core/playwright';

/**
 * Storybook test-runner — the browser interaction + accessibility layer.
 *
 * For EVERY story the runner first executes the story's `play` function (the interaction test —
 * keyboard, focus, activation). This hook then runs axe against the rendered story, scoped to the
 * **WCAG 2.2 AA** rule set (not axe's "best-practice" rules), in real Chromium — so color-contrast
 * and rendered ARIA (which the happy-dom unit layer cannot evaluate) ARE checked here.
 *
 * Docs pages are skipped for a11y (prose, not fixtures — their embedded stories are tested
 * individually). A story may tune rules via `parameters.a11y` — `{ a11y: { disable: true } }` to skip,
 * or `{ a11y: { config: { rules: [{ id, enabled: false }] } } }` to disable a specific rule (used
 * sparingly, always with a documented reason).
 */
const WCAG_22_AA = ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'];

interface A11yParam {
  disable?: boolean;
  config?: { rules?: Array<{ id: string; enabled?: boolean }> };
}

const config: TestRunnerConfig = {
  async postVisit(page, context) {
    if (context.id.endsWith('--docs')) return; // docs pages get a render smoke-test only

    const storyContext = await getStoryContext(page, context);
    const a11y = storyContext.parameters?.a11y as A11yParam | undefined;
    if (a11y?.disable) return;

    const disabledRules = (a11y?.config?.rules ?? [])
      .filter((r) => r.enabled === false)
      .map((r) => r.id);

    let builder = new AxeBuilder({ page }).include('#storybook-root').withTags(WCAG_22_AA);
    if (disabledRules.length) builder = builder.disableRules(disabledRules);

    const { violations } = await builder.analyze();
    if (violations.length) {
      const summary = violations
        .map((v) => `${v.id} [${v.impact}] ×${v.nodes.length} — ${v.nodes[0]?.target.join(' ')}`)
        .join('\n  ');
      throw new Error(`Accessibility violations (WCAG 2.2 AA) in "${context.title} — ${context.name}":\n  ${summary}`);
    }
  },
};

export default config;
