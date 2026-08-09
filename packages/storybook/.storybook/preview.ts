import type { Preview } from '@storybook/web-components';

// THE production artifacts — no approximations.
import '@envision/tokens/css'; // production design tokens (--envision-t1/t2/t3-*)
import '@envision/components'; // registers every <envision-*> custom element

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
        { name: 'brand', value: '#29594f' },
      ],
    },
    // Responsive behavior — the real Envision breakpoints (SYSTEM_SPEC §6).
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
    options: {
      storySort: {
        order: [
          'Introduction',
          ['Overview', 'Using this Storybook', 'Storybook vs the docs site'],
          'Foundations',
          ['Color', 'Typography', 'Spacing & Radius', 'Elevation & Motion'],
          'Components',
          ['Button', 'IconButton', 'Link', 'Label', 'Input', 'Checkbox', 'Radio', 'Switch', 'Badge', 'Tab'],
          'Product Components',
          'Patterns',
          '*',
        ],
      },
    },
  },
  // Theme + brand toolbars — Envision is white-label (theme mode + brand mode).
  globalTypes: {
    theme: {
      description: 'Color scheme',
      defaultValue: 'light',
      toolbar: {
        title: 'Theme',
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
      // Apply the theme the same way the product does — via a data attribute on the root.
      document.documentElement.dataset.theme = context.globals.theme ?? 'light';
      return story();
    },
  ],
  tags: ['autodocs'],
};

export default preview;
