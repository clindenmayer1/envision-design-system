import type { StorybookConfig } from '@storybook/web-components-vite';
import remarkGfm from 'remark-gfm';

/**
 * Envision Storybook, the executable technical specification of the design system.
 * Renders the REAL production Web Components (@envision/components) with the REAL production
 * tokens (@envision/tokens). No Storybook-specific component approximations exist.
 */
const config: StorybookConfig = {
  stories: [
    '../stories/**/*.mdx',
    '../stories/**/*.stories.@(ts|js)',
  ],
  addons: [
    // Essentials minus docs: docs is registered separately below so its MDX compiler options
    // can be set. Registering both without this would load addon-docs twice.
    { name: '@storybook/addon-essentials', options: { docs: false } },
    {
      // Without remark-gfm, MDX does not parse GitHub-flavoured markdown, so every markdown
      // TABLE in the docs pages rendered as a paragraph of pipe characters. 14 pages were
      // affected, including every "Token relationships" table.
      name: '@storybook/addon-docs',
      options: { mdxPluginOptions: { mdxCompileOptions: { remarkPlugins: [remarkGfm] } } },
    },
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
