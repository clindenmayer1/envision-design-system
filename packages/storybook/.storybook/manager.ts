import { addons } from '@storybook/manager-api';
import { create } from '@storybook/theming/create';

const envisionTheme = create({
  base: 'light',
  brandTitle: 'Envision Design System',
  brandUrl: '/',
  colorPrimary: '#29594f',
  colorSecondary: '#29594f',
  appBg: '#fbf8f5',
  barSelectedColor: '#29594f',
  fontBase: '"Inter", system-ui, sans-serif',
});

addons.setConfig({
  theme: envisionTheme,
  sidebar: { showRoots: true },
});
