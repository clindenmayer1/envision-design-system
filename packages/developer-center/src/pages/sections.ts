/**
 * Canonical section orders.
 *
 * Previous/next and the documentation verifier both read these, so a route can never appear in the
 * navigation without a registered page, and the sequence cannot drift page by page.
 */

export type Order = Array<[string, string]>;

export const PATTERN_ORDER: Order = [
  ['Overview', '/patterns/overview'],
  ['Navigation', '/patterns/navigation'],
  ['Forms', '/patterns/forms'],
  ['Selection', '/patterns/selection'],
  ['Filtering', '/patterns/filtering'],
  ['Search', '/patterns/search'],
  ['Empty states', '/patterns/empty-states'],
  ['Loading', '/patterns/loading'],
  ['Errors', '/patterns/errors'],
  ['Confirmation', '/patterns/confirmation'],
  ['Progressive disclosure', '/patterns/progressive-disclosure'],
  ['Responsive patterns', '/patterns/responsive'],
  ['Complex workflows', '/patterns/workflows'],
];

export const A11Y_ORDER: Order = [
  ['Overview', '/accessibility/overview'],
  ['Accessibility principles', '/accessibility/principles'],
  ['WCAG standards', '/accessibility/wcag'],
  ['Color & contrast', '/accessibility/contrast'],
  ['Keyboard navigation', '/accessibility/keyboard'],
  ['Focus management', '/accessibility/focus'],
  ['Screen readers', '/accessibility/screen-readers'],
  ['Semantic structure', '/accessibility/semantics'],
  ['Accessible forms', '/accessibility/forms'],
  ['Motion & reduced motion', '/accessibility/motion'],
  ['Testing requirements', '/accessibility/testing'],
];

export const CONTENT_ORDER: Order = [
  ['Voice & tone', '/content/voice-and-tone'],
  ['Writing principles', '/content/principles'],
  ['UI copy', '/content/ui-copy'],
  ['Labels', '/content/labels'],
  ['Buttons & actions', '/content/actions'],
  ['Forms', '/content/forms'],
  ['Validation & errors', '/content/errors'],
  ['Empty states', '/content/empty-states'],
  ['Notifications', '/content/notifications'],
  ['Terminology', '/content/terminology'],
  ['Accessibility & inclusive language', '/content/inclusive-language'],
];

export const RESOURCE_ORDER: Order = [
  ['Figma library', '/tools/figma'],
  ['Storybook', '/tools/storybook'],
  ['Design tokens', '/tools/tokens'],
  ['Code packages', '/tools/packages'],
  ['Icons', '/tools/icons'],
  ['Templates', '/tools/templates'],
  ['Release notes', '/tools/releases'],
  ['Changelog', '/tools/changelog'],
  ['Support', '/tools/support'],
];

export const GOVERNANCE_ORDER: Order = [
  ['How the system is maintained', '/governance/maintenance'],
  ['Ownership & responsibilities', '/governance/ownership'],
  ['Contribution model', '/governance/contribution'],
  ['Requesting a component', '/governance/requesting-a-component'],
  ['Proposing a change', '/governance/proposing-a-change'],
  ['Design review', '/governance/design-review'],
  ['Engineering review', '/governance/engineering-review'],
  ['Accessibility review', '/governance/accessibility-review'],
  ['Component lifecycle', '/governance/lifecycle'],
  ['Versioning', '/governance/versioning'],
  ['Deprecation', '/governance/deprecation'],
  ['Releases', '/governance/releases'],
  ['Adoption', '/governance/adoption'],
  ['System roadmap', '/governance/roadmap'],
];

/** Builds the prev/next pair and breadcrumb trail for a section. */
export function sectionNav(order: Order, sectionTitle: string, sectionPath: string) {
  return {
    seq: (path: string) => {
      const i = order.findIndex(([, p]) => p === path);
      const at = (n: number) => (order[n] ? { title: order[n][0], to: order[n][1] } : undefined);
      return {
        prev: i > 0 ? at(i - 1) : { title: sectionTitle, to: sectionPath },
        next: at(i + 1),
      };
    },
    trail: (leaf: string) => [
      { label: 'Envision Design System', to: '/' },
      { label: sectionTitle, to: sectionPath },
      { label: leaf },
    ],
  };
}
