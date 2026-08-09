# Visual Regression

Storybook stories are the **stable test fixtures**: every story renders the real production
component in a known state, so each is a deterministic frame to snapshot. Visual regression compares
those frames to committed baselines and fails on any unintended pixel change.

Tool: **Playwright** (`@playwright/test`, `toHaveScreenshot`) against the static Storybook build.
No external SaaS. Config: `playwright.config.ts`; spec: `visual/stories.spec.ts`; baselines:
`visual/__screenshots__/`.

## What receives coverage
- **Every `story`-type entry** in the Storybook index (66 today) — one screenshot per story.
- **Docs pages are excluded** (prose, not fixtures — the stories they embed are covered directly).
- A story opts **out** with `tags: ['no-visual']` — reserved for intentionally non-deterministic
  content (e.g. randomised/animated demos). None today.
- Rendered against the static build (`storybook-static`) for determinism; animations disabled,
  caret hidden, fonts awaited before capture.

## When comparisons run
- On **every pull request** and push to `main` (CI job `visual-regression`), against the baselines
  committed on the branch.
- Locally any time: `npm run visual -w @envision/storybook` (needs `npx playwright install chromium`).

## What constitutes a failure
- A story’s current render differs from its baseline beyond the tolerance
  (`maxDiffPixelRatio: 0.01`, with anti-aliasing tolerance). Any perceptible change to geometry,
  colour, spacing, type, or layout trips it.
- A **new story with no baseline** is not a silent pass — the run reports the missing snapshot; a
  baseline must be generated and committed.

## Intentional change vs accidental regression
The tool cannot tell intent — **a human does, at review time:**
1. CI fails and uploads a **diff report** (side-by-side expected/actual/diff) as an artifact.
2. The reviewer opens it and asks: *did this PR mean to change this component’s appearance?*
   - **Accidental** → it’s a regression. Fix the code; baselines stay untouched.
   - **Intentional** (e.g. a token or design change) → approve it by updating baselines.

## How intentional changes are approved / baselines managed
1. Make the visual change in the component/token.
2. Re-baseline: `npm run visual:update -w @envision/storybook` (writes new `*.png` baselines).
3. **Review the baseline diff in the PR** — the changed `visual/__screenshots__/*.png` are part of
   the code review, so a visual change is an explicit, reviewable, attributable commit.
4. Commit the updated baselines with the change. The PR now shows both the code and its exact
   visual consequence.

Baselines are **committed to the repo** (versioned with the components), so a diff always compares
against the last approved look, and every visual change has a traceable author + reason. When a
token or component intentionally changes, the baseline update is the record of that decision.

## Environment consistency (important)
Pixel snapshots are **environment-specific** — font rendering differs across OSes. The baselines
committed here were generated locally (macOS) to demonstrate the mechanism. For a real pipeline,
baselines must be generated in the **same environment CI compares in** (Linux). The standard setup:
run the visual job once with `--update-snapshots` in the CI Linux runner (or the
`mcr.microsoft.com/playwright` Docker image) and commit those Linux baselines — after that,
comparisons are pixel-exact. Until Linux baselines are bootstrapped, treat the `visual-regression`
job as advisory. (Playwright pins the Chromium version, so the browser itself is deterministic;
only the OS text rasteriser varies.)

> This is deliberately SaaS-free (Playwright + committed PNGs). If cross-browser/-OS rendering or a
> hosted review UI is later wanted, the same Storybook stories plug into Chromatic unchanged — the
> fixtures don’t move.
