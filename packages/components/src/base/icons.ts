/**
 * Inline SVG glyphs for component-owned chrome.
 *
 * Components must not depend on a host application loading an icon font. A ligature such as
 * `chevron_right` renders as the literal word in any host that has not loaded Material Symbols,
 * which is exactly what happened when the Envision product first adopted OptionCard. Glyphs a
 * component draws for ITSELF therefore ship with the component.
 *
 * Consumer-supplied icons (Button `leadingIcon`, IconButton `icon`, …) remain ligature-based:
 * those names come from the Material Symbols set the host chooses to load, and inlining an
 * open-ended icon set here is not the component library's job.
 */
const svg = (path: string, extra = ''): string =>
  `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false" ${extra}>${path}</svg>`;

export const ICON = {
  chevronRight: svg('<path d="M9 6l6 6-6 6"/>'),
  check: svg('<path d="M5 12l5 5 9-10"/>', 'stroke-width="3"'),
  /** Broken/absent media placeholder. */
  brokenImage: svg(
    '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 15l4-4 4 4 3-3 3 3"/><circle cx="9" cy="9" r="1.2"/>',
    'stroke-width="1.6"',
  ),
} as const;
