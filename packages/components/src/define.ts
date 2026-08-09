/**
 * Side-effect entry: registers every Envision custom element with the platform
 * registry. Importing `@envision/components` (which imports this) makes all
 * `<envision-*>` tags available. Registration is idempotent (safe to import twice).
 */
import { define } from './base/element.js';
import { EnvisionButton } from './button/Button.js';
import { EnvisionIconButton } from './icon-button/IconButton.js';
import { EnvisionLink } from './link/Link.js';
import { EnvisionLabel } from './label/Label.js';
import { EnvisionBadge } from './badge/Badge.js';
import { EnvisionCheckbox } from './checkbox/Checkbox.js';
import { EnvisionSwitch } from './switch/Switch.js';
import { EnvisionInput } from './input/Input.js';
import { EnvisionRadio } from './radio/Radio.js';
import { EnvisionTab } from './tab/Tab.js';
import { EnvisionMaterialSwatch } from './material-swatch/MaterialSwatch.js';
import { EnvisionOptionCard } from './option-card/OptionCard.js';
import { EnvisionPackageCard } from './package-card/PackageCard.js';
import { EnvisionRightRail } from './right-rail/RightRail.js';

define('envision-button', EnvisionButton);
define('envision-icon-button', EnvisionIconButton);
define('envision-link', EnvisionLink);
define('envision-label', EnvisionLabel);
define('envision-badge', EnvisionBadge);
define('envision-checkbox', EnvisionCheckbox);
define('envision-switch', EnvisionSwitch);
define('envision-input', EnvisionInput);
define('envision-radio', EnvisionRadio);
define('envision-tab', EnvisionTab);
define('envision-material-swatch', EnvisionMaterialSwatch);
define('envision-option-card', EnvisionOptionCard);
define('envision-package-card', EnvisionPackageCard);
define('envision-right-rail', EnvisionRightRail);
