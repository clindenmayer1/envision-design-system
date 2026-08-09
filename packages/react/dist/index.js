/**
 * @envision/react — thin React wrappers over the Envision custom elements.
 *
 * Importing this registers the elements (via @envision/components) and exposes each component
 * under its MEANINGFUL name (Button, Input, OptionCard…). Prop TYPES mirror the element contracts
 * for editor ergonomics; there is no behavioral logic here (see createComponent).
 *
 * Consumers still load tokens once:  import '@envision/tokens/css';
 */
import '@envision/components'; // side effect: define all <envision-*> elements
import { createComponent } from './createComponent.js';
export const Button = createComponent('envision-button');
export const IconButton = createComponent('envision-icon-button');
export const Link = createComponent('envision-link');
export const Label = createComponent('envision-label');
export const Badge = createComponent('envision-badge');
export const Checkbox = createComponent('envision-checkbox');
export const Switch = createComponent('envision-switch');
export const Input = createComponent('envision-input');
export const Radio = createComponent('envision-radio');
export const Tab = createComponent('envision-tab');
export { createComponent } from './createComponent.js';
//# sourceMappingURL=index.js.map