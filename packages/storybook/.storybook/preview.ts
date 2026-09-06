import type { Preview } from '@storybook/web-components';

// THE production artifacts, no approximations.
import '@envision/tokens/css'; // production design tokens (--envision-t1/t2/t3-*)
import '@envision/components'; // registers every <envision-*> custom element

// Envision is white-label: one system, many builder brands. The themes below are the real
// theme documents from the token package, applied through the same applyTheme() the product
// uses, so a story rendered under a theme here is rendered exactly as a builder would see it.
import { applyTheme } from '@envision/tokens/theme';
import envisionTheme from '@envision/tokens/themes/envision';
import westlakeTheme from '@envision/tokens/themes/westlake';
import harborTheme from '@envision/tokens/themes/example-harbor';
import citrineTheme from '@envision/tokens/themes/example-citrine';

const THEMES = {
  envision: envisionTheme,
  westlake: westlakeTheme,
  'example-harbor': harborTheme,
  'example-citrine': citrineTheme,
} as const;

const preview: Preview = {
  parameters: {
    layout: 'centered',
    controls: {
      expanded: true,
      matchers: { color: /(color|background)$/i, date: /Date$/i },
    },
    // Real Envision surface roles as backgrounds (from the token system).
    backgrounds: {
      default: 'surface',
      values: [
        { name: 'surface', value: '#ffffff' },
        { name: 'surface-warm', value: '#fbf8f5' },
        { name: 'surface-sunken', value: '#edeae4' },
        // Resolved through the token, not pinned to a hex — the brand surface follows
        // whichever builder theme is selected in the toolbar.
        { name: 'brand', value: 'var(--envision-t2-color-background-brand-default)' },
      ],
    },
    // Responsive behavior, the real Envision breakpoints (SYSTEM_SPEC §6).
    viewport: {
      viewports: {
        mobile: { name: 'Mobile (390)', styles: { width: '390px', height: '844px' } },
        tablet: { name: 'Tablet / rail→sheet (1024)', styles: { width: '1024px', height: '800px' } },
        desktop: { name: 'Desktop (1280)', styles: { width: '1280px', height: '900px' } },
        wide: { name: 'Wide (1440)', styles: { width: '1440px', height: '900px' } },
      },
    },
    a11y: {
      // WCAG 2.2 AA is the Envision target (ACCESSIBILITY.md).
      config: { rules: [{ id: 'color-contrast', enabled: true }] },
    },
    // Sidebar organization follows the canonical component taxonomy published by the design
    // system (component-registry.json → meta.componentTaxonomy). The seven categories are held
    // in that fixed order; components inside each are alphabetized by Storybook's default
    // comparator, which is what the trailing '*' delegates to.
    options: {
      storySort: {
        order: [
          'Introduction',
          ['Overview', 'How Envision is documented', 'Using this Storybook', 'Component index'],
          'Foundations',
          ['Tokens', 'Theming', 'Color', 'Typography', 'Spacing & Radius', 'Border', 'Elevation & Motion', 'Iconography'],
          'Components',
          [
            'Actions',
            'Inputs & Selection',
            'Navigation',
            'Data Display',
            'Feedback & Guidance',
            'Panels',
            'Status & Progress',
            '*',
          ],
          '*',
        ],
      },
    },
  },
  globalTypes: {
    // The white-label switcher. Every component in this Storybook must hold up under any
    // builder theme, so the theme is a global rather than a per-story decision.
    brand: {
      description: 'Builder theme (white-label brand layer)',
      defaultValue: 'envision',
      toolbar: {
        title: 'Brand',
        icon: 'paintbrush',
        items: [
          { value: 'envision', title: 'Envision Default (unbranded)' },
          { value: 'westlake', title: 'Westlake (builder)' },
          { value: 'example-harbor', title: 'Example · Harbor' },
          { value: 'example-citrine', title: 'Example · Citrine (light brand)' },
        ],
        dynamicTitle: true,
      },
    },
    scheme: {
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Scheme',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light' },
          { value: 'dark', title: 'Dark (architecture-ready)' },
        ],
        dynamicTitle: true,
      },
    },
  },
  decorators: [
    (story, context) => {
      // Apply the scheme the same way the product does, via a data attribute on the root.
      document.documentElement.dataset.theme = context.globals.scheme ?? 'light';
      // Apply the builder theme through the production runtime. Only the brand layer is set;
      // every semantic role and component token re-resolves through the normal cascade, which
      // is precisely the property a white-label system has to guarantee.
      const theme = THEMES[context.globals.brand as keyof typeof THEMES] ?? THEMES.envision;
      applyTheme(theme);
      return story();
    },
  ],
  tags: ['autodocs'],
};

export default preview;
