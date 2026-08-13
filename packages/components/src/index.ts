/**
 * @envision/components, public entry.
 *
 * Importing this module registers all `<envision-*>` custom elements (side effect)
 * and re-exports the element classes for programmatic/typed use.
 *
 * The public API is the set of MEANINGFUL component names (Button, Input, OptionCard…),
 * NOT the internal Atomic-Design tiers. Consumers use `<envision-button>` in HTML or the
 * `EnvisionButton` class / the `@envision/react` wrapper, they never need to know a
 * component is an "atom", "molecule", or "organism".
 *
 * Tokens: consumers must load the design tokens once at the document level:
 *   import '@envision/tokens/css';
 * The `--envision-*` custom properties inherit through the shadow boundary.
 */
import './define.js';

export { EnvisionElement, define } from './base/element.js';
export { css, cssSource } from './base/css.js';
export { EnvisionButton } from './button/Button.js';
export { EnvisionIconButton } from './icon-button/IconButton.js';
export { EnvisionLink } from './link/Link.js';
export { EnvisionLabel } from './label/Label.js';
export { EnvisionBadge } from './badge/Badge.js';
export { EnvisionCheckbox } from './checkbox/Checkbox.js';
export { EnvisionSwitch } from './switch/Switch.js';
export { EnvisionInput } from './input/Input.js';
export { EnvisionRadio } from './radio/Radio.js';
export { EnvisionTab } from './tab/Tab.js';
export { EnvisionMaterialSwatch } from './material-swatch/MaterialSwatch.js';
export { EnvisionOptionCard } from './option-card/OptionCard.js';
export { EnvisionPackageCard } from './package-card/PackageCard.js';
export { EnvisionRightRail } from './right-rail/RightRail.js';
export type { MaterialOption, KitchenPackage } from './types.js';
