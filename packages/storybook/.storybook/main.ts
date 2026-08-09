import type { StorybookConfig } from '@storybook/web-components-vite';

/**
 * Envision Storybook — the executable technical specification of the design system.
 * Renders the REAL production Web Components (@envision/components) with the REAL production
 * tokens (@envision/tokens). No Storybook-specific component approximations exist.
 */
const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|js)',
  ],
  addons: [
    '@storybook/addon-essentials', // docs, controls, actions, backgrounds, viewport, toolbars, measure, outline
    '@storybook/addon-a11y', // accessibility-testing environment
    '@storybook/addon-interactions', // interaction-testing environment (play functions)
  ],
  framework: {
    name: '@storybook/web-components-vite',
    options: {},
  },
  docs: {
    // every component gets an autodocs page; hand-authored MDX augments it where present
    defaultName: 'Docs',
  },
  core: { disableTelemetry: true },
};

export default config;
