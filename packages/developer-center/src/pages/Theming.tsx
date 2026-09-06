import { Callout, CodeBlock, DoDont, DocCard, DocGrid, SectionIntro } from '../modules';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { ThemeRampComposition } from './visuals';
import { DocArticle, SectionLanding, H2 } from '../templates';
import { sectionNav } from './sections';
import type { Order } from './sections';

import { themeCssPropertyNames, ALLOWED_OVERRIDES, validateTheme } from '@envision/tokens/theme';
import type { Theme } from '@envision/tokens/theme';
import envision from '@envision/tokens/themes/envision';
import westlake from '@envision/tokens/themes/westlake';
import harbor from '@envision/tokens/themes/example-harbor';
import citrine from '@envision/tokens/themes/example-citrine';

/**
 * Theming and white-label.
 *
 * Envision is not a single-brand product. One system serves many builders, and the expectation is
 * hundreds or thousands of them. That fact has to be visible in the documentation, because the
 * most common way a white-label system fails is that its own default brand is quietly treated as
 * universal: a "the green" that a component, a token or a paragraph assumes will always be there.
 *
 * Everything on these pages is read from the real theme documents and the real validator in
 * @envision/tokens, so the docs cannot claim a guarantee the build does not enforce.
 */

const THEMING_ORDER: Order = [
  ['Overview', '/theming'],
  ['The theming contract', '/theming/contract'],
  ['Authoring a builder theme', '/theming/authoring'],
  ['Applying a theme', '/theming/applying'],
  ['Theme validation', '/theming/validation'],
  ['Designing for white-label', '/theming/designing'],
];

const nav = sectionNav(THEMING_ORDER, 'Theming', '/theming');
const trail = nav.trail;
const seq = nav.seq;

// The JSON imports widen `kind` to string, so assert the documents against the published type.
const THEMES: Theme[] = [envision, westlake, harbor, citrine] as unknown as Theme[];
const CONTRACT_COUNT = themeCssPropertyNames().length;

/* ------------------------------------------------------------------ shared */

function Ramp({ theme }: { theme: Theme }) {
  const steps = Object.entries(theme.brand.primary);
  return (
    <div style={{ marginBlockEnd: 'var(--dc-space-6)' }}>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--dc-space-3)', marginBlockEnd: 'var(--dc-space-2)' }}>
        <strong>{theme.name}</strong>
        <code>{theme.id}</code>
        <span style={{ fontSize: 'var(--envision-t1-font-size-12)', textTransform: 'uppercase', letterSpacing: '.06em', color: 'var(--envision-t2-color-content-tertiary-default)' }}>
          {theme.kind}
        </span>
      </div>
      <div style={{ display: 'flex', borderRadius: 'var(--envision-t2-border-radius-control)', overflow: 'hidden', maxWidth: '100%' }}>
        {steps.map(([step, hex]) => (
          <div
            key={step}
            style={{
              flex: 1, minWidth: 0, height: 44, background: hex,
              display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
              fontSize: 10, paddingBottom: 'var(--dc-space-1)',
              color: Number(step) >= 500 ? '#fff' : 'rgba(0,0,0,.62)',
            }}
          >
            {step}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--dc-space-3)', marginBlockStart: 'var(--dc-space-3)', flexWrap: 'wrap' }}>
        <span style={{
          background: theme.brand.primary['500'], color: theme.brand.contentOnBrand,
          padding: '8px 16px', borderRadius: 'var(--envision-t2-border-radius-control)',
          fontSize: 'var(--envision-t1-font-size-13)', fontWeight: 600,
        }}>
          Primary button
        </span>
        <code>contentOnBrand {theme.brand.contentOnBrand}</code>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------- overview */

export function Theming() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Theming' }]}
      title="Theming"
      lead="Envision is a white-label platform. One system serves many builders, each with their own branding, and a brand is data applied to the system rather than a fork of it."
      intro={
        <SectionIntro
          heading="One system, many brands"
          body="Every builder sees a product that looks like theirs, built from the same components, spacing and accessibility guarantees. Only a narrow, defined layer changes: the brand colors and the brand typefaces. Because that number is expected to reach the thousands, a theme is measured rather than reviewed, and supplied as data rather than as a branch."
          cta={{ label: 'Read the contract', to: '/theming/contract' }}
          visual={<ThemeRampComposition />}
        />
      }
      grid={
        <DocGrid>
          <DocCard to="/theming/contract" title="The theming contract">
            What a theme may change, and the much longer list of what it may not.
          </DocCard>
          <DocCard to="/theming/authoring" title="Authoring a builder theme">
            The theme document, its schema, and a complete worked example.
          </DocCard>
          <DocCard to="/theming/applying" title="Applying a theme">
            The runtime API, and why nothing downstream needs to know a theme changed.
          </DocCard>
          <DocCard to="/theming/validation" title="Theme validation">
            The contrast gate that lets thousands of themes ship without a reviewer.
          </DocCard>
          <DocCard to="/theming/designing" title="Designing for white-label">
            How to design a component that survives a brand color you have never seen.
          </DocCard>
          <DocCard to="/tokens/brand" title="Brand tokens">
            The token layer this all rests on.
          </DocCard>
        </DocGrid>
      }
      related={[
        { title: 'Token architecture', to: '/tokens/architecture', note: 'Where the brand layer sits.' },
        { title: 'Color', to: '/foundations/color', note: 'Which color decisions are themeable.' },
        { title: 'Color & contrast', to: '/accessibility/contrast', note: 'The accessibility floor a theme must clear.' },
      ]}
      next={{ title: 'The theming contract', to: '/theming/contract' }}
    >
      <H2 id="themes">The themes in this repository</H2>
      <p>
        The default is deliberately unbranded. It is what the system looks like before a builder theme loads, and
        keeping it colorless is what stops any one builder's palette from being mistaken for the system's own.
      </p>
      {THEMES.map((t) => <Ramp key={t.id} theme={t} />)}
      <Callout type="Important" title="Example themes are fictional">
        Themes prefixed <code>example-</code> exist for documentation and tests. They are not builders, and no
        inference should be drawn from them about who is on the platform.
      </Callout>
    </SectionLanding>
  );
}

/* ---------------------------------------------------------------- contract */

/** Measured from the Figma GlobalNav (265:6) and its Logo component (312:63). */
const NAV_HEIGHT = 64;
const LOGO_HEIGHT = 35;

export function ThemingContract() {
  const invariant = [
    ['Neutrals', 'Surfaces, borders and body text. A builder brand changes the accent of a page, not its ground.'],
    ['Status colors', 'Success, warning, error and info. An error must look like an error on every builder, to every user, regardless of brand.'],
    ['Spacing and radius', 'Rhythm and shape are system decisions. Rebranding does not change how far apart two things sit.'],
    ['Type scale', 'Sizes, weights and line heights. A theme may change the display typeface; it may not change the scale.'],
    ['Elevation and motion', 'Shadow and timing express hierarchy and responsiveness, not identity.'],
    ['Z-index and breakpoints', 'Structural. Changing these would change behavior, not appearance.'],
  ];

  return (
    <DocArticle
      trail={trail('The theming contract')}
      title="The theming contract"
      lead={`A theme supplies the brand layer and the builder logo, and nothing else: ${CONTRACT_COUNT} custom properties, three narrowly scoped overrides, and one piece of artwork.`}
      toc={[
        { id: 'themeable', label: 'What a theme may change' },
        { id: 'logo', label: 'The builder logo' },
        { id: 'invariant', label: 'What a theme may not change' },
        { id: 'narrow', label: 'Why the seam is narrow' },
        { id: 'overrides', label: 'The three escape hatches' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'Authoring a builder theme', to: '/theming/authoring', note: 'Putting the contract to use.' },
        { title: 'Brand tokens', to: '/tokens/brand', note: 'The layer being replaced.' },
        { title: 'Semantic tokens', to: '/tokens/semantic', note: 'What consumes the brand layer.' },
      ]}
      {...seq('/theming/contract')}
    >
      <H2 id="themeable">What a theme may change</H2>
      <p>
        Four things, and only these four:
      </p>
      <ul>
        <li><code>brand.primary</code>: the full 50 to 900 brand ramp. 500 is the base action color; 600 and 700 are its hover and pressed states; 50 is the subtle brand surface.</li>
        <li><code>brand.accent</code>: the full 50 to 900 accent ramp.</li>
        <li><code>brand.contentOnBrand</code>: the content color that sits on top of the brand fill.</li>
        <li><code>brand.fontFamily.display</code> and <code>brand.fontFamily.wordmark</code>: the brand typefaces.</li>
      </ul>
      <p>
        Both ramps must be complete. A partial ramp leaves hover, pressed and subtle states undefined, which is how a
        theme ends up looking finished and behaving broken.
      </p>

      <H2 id="logo">The builder logo</H2>
      <p>
        The logo is the one part of a builder&rsquo;s identity that is not a token. It is artwork the builder supplies,
        so the system cannot generate it, recolor it, or validate it the way it validates a ramp. What the system owns
        is the <strong>slot</strong> the artwork sits in.
      </p>
      <ScrollTable head={['Rule', 'Why']}>
        <tr>
          <td style={TABLE_CELL}><strong>Fixed height, free width</strong></td>
          <td style={TABLE_CELL}>
            The slot is {LOGO_HEIGHT}px tall in the {NAV_HEIGHT}px global nav. The artwork scales to that height and
            takes whatever width its own aspect ratio gives it. Height is what makes twenty builder logos look like
            one system; width is the builder&rsquo;s to vary.
          </td>
        </tr>
        <tr>
          <td style={TABLE_CELL}><strong>Never recolored</strong></td>
          <td style={TABLE_CELL}>
            A logo is not a themeable color. The brand ramp does not tint it, and it does not inherit{' '}
            <code>currentColor</code>. A builder supplies whatever versions it needs for the surfaces it appears on.
          </td>
        </tr>
        <tr>
          <td style={TABLE_CELL}><strong>The bar does not resize around it</strong></td>
          <td style={TABLE_CELL}>
            A taller logo does not make a taller nav. If the artwork does not read at the slot height, the answer is
            different artwork, not a different bar, because the bar height is a system decision every screen depends on.
          </td>
        </tr>
        <tr>
          <td style={TABLE_CELL}><strong>It carries the accessible name</strong></td>
          <td style={TABLE_CELL}>
            The mark is the builder&rsquo;s name to a sighted reader, so it must be one to everybody: the builder
            supplies the text, and it is the link&rsquo;s name, not decoration.
          </td>
        </tr>
      </ScrollTable>
      <Callout type="Important" title="The theme document has no logo field yet">
        Everything above is the rule the Figma library follows, but <code>theme.schema.json</code> describes only the
        brand ramps and typefaces. A builder logo currently arrives outside the theme document, which means it is the
        one part of a brand that the contrast gate and the theme validator never see. Closing that gap is a change to
        the schema, not to this page.
      </Callout>

      <H2 id="invariant">What a theme may not change</H2>
      <p>
        Everything else. These belong to the system, not the builder:
      </p>
      <ScrollTable head={['Invariant', "Why it is not a builder's to change"]}>
        {invariant.map(([k, v]) => (
          <tr key={k}><td style={TABLE_CELL}><strong>{k}</strong></td><td style={TABLE_CELL}>{v}</td></tr>
        ))}
      </ScrollTable>

      <H2 id="narrow">Why the seam is narrow</H2>
      <p>
        A wider seam looks more generous and is much worse. Every additional themeable property is another axis a
        component must be correct along, another pair a contrast gate has to measure, and another way a builder can
        make the product inaccessible without meaning to.
      </p>
      <p>
        A narrow seam is what makes a theme <strong>measurable</strong>. {CONTRACT_COUNT} properties can be validated
        automatically in milliseconds. A system where a builder can override any token cannot be validated at all, and
        so it degrades into a review queue that does not scale past a handful of brands.
      </p>

      <H2 id="overrides">The three escape hatches</H2>
      <p>
        A small number of semantic roles derive from the brand ramp and are usually right, but can fail for an unusual
        brand. Rather than force every theme to restate them, a theme overrides them only when the gate says it must:
      </p>
      <ul>{ALLOWED_OVERRIDES.map((o) => <li key={o}><code>{o}</code></li>)}</ul>
      <p>
        Anything outside this list is rejected by validation. There is no mechanism for a builder to reach a neutral,
        a status color, or a spacing value, and that is deliberate.
      </p>

      <H2 id="dodont">Do and don’t</H2>
      <DoDont
        items={[
          { kind: 'do', text: 'Treat the brand layer as the only themeable surface.' },
          { kind: 'dont', text: 'Assume any particular brand color exists.' },
          { kind: 'do', text: 'Supply complete ramps, so every state has a defined value.' },
          { kind: 'dont', text: 'Ask for a new themeable property to solve a one-off visual problem.' },
          { kind: 'do', text: 'Set contentOnBrand deliberately, based on the brand color’s lightness.' },
          { kind: 'dont', text: 'Override a role to achieve a look rather than to pass a gate.' },
        ]}
      />
    </DocArticle>
  );
}

/* --------------------------------------------------------------- authoring */

const EXAMPLE_THEME = `{
  "$schema": "envision-theme@1",
  "id": "harbor-homes",
  "name": "Harbor Homes",
  "version": "1.0.0",
  "kind": "builder",
  "brand": {
    "primary": {
      "50":  "#EAF1F7", "100": "#D3E3F0", "200": "#A7C6E0", "300": "#7BA9D0",
      "400": "#4F8CC0", "500": "#1F5F9E", "600": "#1A5086", "700": "#16456F",
      "800": "#0E2C48", "900": "#071925"
    },
    "accent": {
      "50":  "#FDF2E4", "100": "#FAE3C6", "200": "#F5C88D", "300": "#EFAC54",
      "400": "#E9911B", "500": "#D07C0C", "600": "#AD670A", "700": "#8C5308",
      "800": "#4F2F05", "900": "#281802"
    },
    "contentOnBrand": "#FFFFFF",
    "fontFamily": { "display": "Playfair Display", "wordmark": "Georgia" }
  }
}`;

export function ThemingAuthoring() {
  return (
    <DocArticle
      trail={trail('Authoring a builder theme')}
      title="Authoring a builder theme"
      lead="A theme is a JSON document validated against a published schema. It carries color and typeface, and no logic."
      toc={[
        { id: 'shape', label: 'The document' },
        { id: 'ramps', label: 'Building the ramps' },
        { id: 'oncolor', label: 'Choosing contentOnBrand' },
        { id: 'validate', label: 'Validating before you ship' },
      ]}
      related={[
        { title: 'The theming contract', to: '/theming/contract', note: 'What the fields may contain.' },
        { title: 'Theme validation', to: '/theming/validation', note: 'The gate this must pass.' },
        { title: 'Applying a theme', to: '/theming/applying', note: 'Getting it into the product.' },
      ]}
      {...seq('/theming/authoring')}
    >
      <H2 id="shape">The document</H2>
      <p>A complete builder theme, with nothing omitted:</p>
      <CodeBlock language="json" code={EXAMPLE_THEME} />
      <Callout type="Note" title="kind matters">
        <code>kind</code> separates the unbranded <code>default</code> from a real <code>builder</code> theme and from
        the fictional <code>example</code> themes used in documentation. Exactly one theme in the system is the
        default.
      </Callout>

      <H2 id="ramps">Building the ramps</H2>
      <p>
        Both ramps run 50 to 900 with the base color at 500, matching every other color family in Envision. The
        steps are not decorative: 600 and 700 are the hover and pressed states of any brand-filled control, and 50 is
        the subtle brand surface behind things like selected rows.
      </p>
      <p>
        Supplying a brand color without the rest of its ramp is the most common authoring mistake. It leaves the
        product with a correct-looking button that has no visible hover state.
      </p>

      <H2 id="oncolor">Choosing contentOnBrand</H2>
      <p>
        This is the field that catches people out. It is the color of the label on a primary button, the text in a
        promotional badge, and the check inside a selection indicator: everything that sits on top of the brand
        color.
      </p>
      <p>
        White is right for most brands and wrong for pale ones. Compare the two example themes: Harbor keeps white,
        Citrine flips to near-black. Neither is a special case in any component; both are the theme answering a
        question the system asked it.
      </p>
      <Ramp theme={THEMES[2]} />
      <Ramp theme={THEMES[3]} />

      <H2 id="validate">Validating before you ship</H2>
      <p>Run the theme through the same validator the build uses:</p>
      <CodeBlock
        language="js"
        code={`import { validateTheme } from '@envision/tokens/theme';

const result = validateTheme(theme);
if (!result.ok) {
  console.error(result.errors.join('\\n'));
  process.exit(1);
}`}
      />
      <p>
        Each error names the failing pair, the measured ratio, the required ratio, and the reason that pair exists.
        It is intended to be actionable without knowing the internals of the token system.
      </p>
    </DocArticle>
  );
}

/* ---------------------------------------------------------------- applying */

export function ThemingApplying() {
  return (
    <DocArticle
      trail={trail('Applying a theme')}
      title="Applying a theme"
      lead="A theme is applied by setting the brand custom properties on the root element. Nothing downstream is aware it happened."
      toc={[
        { id: 'runtime', label: 'At runtime' },
        { id: 'cascade', label: 'Why nothing else needs to change' },
        { id: 'shadow', label: 'Web components and the shadow boundary' },
        { id: 'build', label: 'Build-time delivery' },
      ]}
      related={[
        { title: 'Authoring a builder theme', to: '/theming/authoring', note: 'Producing the document.' },
        { title: 'CSS tokens', to: '/tokens/css', note: 'The custom properties being set.' },
        { title: 'Token architecture', to: '/tokens/architecture', note: 'The chain that re-resolves.' },
      ]}
      {...seq('/theming/applying')}
    >
      <H2 id="runtime">At runtime</H2>
      <CodeBlock
        language="js"
        code={`import { applyTheme } from '@envision/tokens/theme';

const theme = await fetchBuilderTheme(builderId);
const remove = applyTheme(theme);   // returns a disposer`}
      />
      <p>
        <code>applyTheme</code> clears the whole contract before it writes, so swapping a theme that sets an override
        for one that does not cannot leave the previous theme's value behind.
      </p>

      <H2 id="cascade">Why nothing else needs to change</H2>
      <p>
        Only the brand layer is set. Every semantic role and every component token is defined in terms of that layer,
        so they all re-resolve through the ordinary cascade. A primary button does not read the theme; it reads
        <code>--envision-t3-button-primary-color-background-default</code>, which points at a semantic role, which
        points at the brand ramp.
      </p>
      <p>
        This is the property a white-label system has to guarantee, and it is the practical payoff of the token
        architecture. No component contains a branch for which builder is active.
      </p>

      <H2 id="shadow">Web components and the shadow boundary</H2>
      <p>
        Envision components are custom elements with shadow DOM. Custom properties inherit through the shadow
        boundary, so a component picks up the active theme with no plumbing of its own and no props to thread.
      </p>

      <H2 id="build">Build-time delivery</H2>
      <p>
        For a builder who wants a pinned, pre-compiled stylesheet rather than a runtime fetch, the same theme document
        renders to CSS:
      </p>
      <CodeBlock
        language="js"
        code={`import { themeToCss } from '@envision/tokens/theme';

themeToCss(theme, ':root');   // or a [data-envision-theme="…"] selector`}
      />
      <p>
        The default theme ships this way already, as <code>@envision/tokens/css/brand</code>, which is emitted
        separately from the semantic layer precisely so it can be replaced on its own.
      </p>
    </DocArticle>
  );
}

/* -------------------------------------------------------------- validation */

export function ThemingValidation() {
  const rows = THEMES.map((t) => {
    const r = validateTheme(t);
    const worst = r.results.length ? r.results.reduce((a, b) => ((a.ratio ?? 0) <= (b.ratio ?? 0) ? a : b)) : null;
    return { theme: t, result: r, worst };
  });

  return (
    <DocArticle
      trail={trail('Theme validation')}
      title="Theme validation"
      lead="With thousands of themes, contrast cannot be reviewed by eye. Every theme is measured against pairs derived from real token chains, and a theme that fails does not ship."
      toc={[
        { id: 'why', label: 'Why measured, not reviewed' },
        { id: 'pairs', label: 'The pairs, and where they come from' },
        { id: 'current', label: 'Current results' },
        { id: 'failing', label: 'What a failure looks like' },
      ]}
      related={[
        { title: 'Color & contrast', to: '/accessibility/contrast', note: 'The standard being applied.' },
        { title: 'Authoring a builder theme', to: '/theming/authoring', note: 'Fixing a theme that fails.' },
        { title: 'Testing requirements', to: '/accessibility/testing', note: 'Where this sits among other checks.' },
      ]}
      {...seq('/theming/validation')}
    >
      <H2 id="why">Why measured, not reviewed</H2>
      <p>
        A design system with one brand can put contrast in a checklist and trust a reviewer. A platform with a
        thousand brands cannot: the reviewer becomes the bottleneck, and the moment they are bypassed the guarantee is
        gone. Accessibility that depends on someone remembering is not a guarantee.
      </p>
      <p>
        So the check is mechanical. It runs on every theme, in CI, and it fails the build.
      </p>

      <H2 id="pairs">The pairs, and where they come from</H2>
      <p>
        Every pair is derived from a real token chain in the built CSS, not invented for the test:
      </p>
      <ul>
        <li>The primary button and promotional badge label on the brand fill, in its default, hover and pressed states.</li>
        <li>The focus ring against both the default and sunken surfaces, per WCAG 1.4.11.</li>
        <li>Brand-colored text on the page surface, at rest and on hover.</li>
        <li>Body text on the subtle brand surface.</li>
      </ul>
      <p>
        The other side of each pair is an invariant: a neutral the builder cannot change. That is what makes the
        measurement meaningful.
      </p>

      <H2 id="current">Current results</H2>
      <ScrollTable head={['Theme', 'Kind', 'Result', 'Tightest pair', 'Overrides']}>
        {rows.map(({ theme, result, worst }) => (
          <tr key={theme.id}>
            <td style={TABLE_CELL}><code>{theme.id}</code></td>
            <td style={TABLE_CELL}>{theme.kind}</td>
            <td style={TABLE_CELL}><strong>{result.ok ? 'passes' : 'fails'}</strong></td>
            <td style={TABLE_CELL}>{worst ? `${worst.id} at ${worst.ratio}:1 (min ${worst.min})` : 'None'}</td>
            <td style={TABLE_CELL}>{theme.overrides ? Object.keys(theme.overrides).length : 0}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        This table is computed from the theme documents when the page renders, so it cannot drift from what the build
        enforces.
      </p>

      <H2 id="failing">What a failure looks like</H2>
      <p>
        The Citrine example theme is pale enough that white text on it falls to roughly 1.7:1, far below the 4.5:1 a
        button label needs. It also cannot use its own brand color as a focus ring, because the ring would be nearly
        invisible on a white surface.
      </p>
      <p>
        The theme resolves both: it sets <code>contentOnBrand</code> to near-black and overrides the focus and brand
        text roles to darker steps of its own ramp. That is the intended workflow: the gate names the problem, the
        theme answers it, and no component is modified.
      </p>
      <Callout type="Important" title="A failing theme is not a component bug">
        When a theme fails a gate, the fix belongs in the theme. Changing a component to accommodate one builder's
        palette is how a white-label system stops being one.
      </Callout>
    </DocArticle>
  );
}

/* --------------------------------------------------------------- designing */

export function ThemingDesigning() {
  return (
    <DocArticle
      trail={trail('Designing for white-label')}
      title="Designing for white-label"
      lead="Design and build for a brand color you have never seen. The default theme is deliberately unbranded so that assumption is uncomfortable to make."
      toc={[
        { id: 'assume', label: 'Assume nothing about the brand' },
        { id: 'roles', label: 'Reach for roles, never the ramp' },
        { id: 'pairs', label: 'Never pair a fixed color with a brand surface' },
        { id: 'meaning', label: 'Brand color cannot carry meaning' },
        { id: 'check', label: 'Check the pale case' },
        { id: 'dodont', label: 'Do and don’t' },
      ]}
      related={[
        { title: 'The theming contract', to: '/theming/contract', note: 'The boundary you are designing against.' },
        { title: 'Color', to: '/foundations/color', note: 'Which roles exist.' },
        { title: 'Using tokens in components', to: '/tokens/using-tokens', note: 'Choosing the right layer.' },
      ]}
      {...seq('/theming/designing')}
    >
      <H2 id="assume">Assume nothing about the brand</H2>
      <p>
        There is no Envision green. There is a default theme, currently a neutral ink, and there are builder themes.
        Any sentence, mockup or component that assumes a specific brand color is a latent bug that will surface on
        the builder whose brand breaks it.
      </p>
      <p>
        In Figma, the brand layer is a mode on the <strong>T2 · Brand</strong> collection. Switching modes on a frame
        shows the design under a different builder, and that check takes seconds.
      </p>

      <H2 id="roles">Reach for roles, never the ramp</H2>
      <p>
        Consume <code>background/brand</code>, <code>content/on-brand</code>, <code>border/brand</code>. Reaching past
        them into <code>color/primary/500</code> couples a component to the ramp's shape rather than to its meaning,
        and skips the role that a theme override is able to correct.
      </p>

      <H2 id="pairs">Never pair a fixed color with a brand surface</H2>
      <p>
        White text on a brand fill is the single most common white-label failure, and it is invisible until the first
        pale brand arrives. Use <code>content/on-brand</code>, which the theme sets and the gate measures.
      </p>
      <DoDont
        items={[
          { kind: 'do', text: 'Use the role the theme sets and the gate measures.', example: <code>color: var(--envision-t2-color-content-on-brand-default)</code> },
          { kind: 'dont', text: 'Pin the content color and hope every brand is dark enough.', example: <code>color: #fff</code> },
        ]}
      />

      <H2 id="meaning">Brand color cannot carry meaning</H2>
      <p>
        Selection, status and error are never expressed by brand color alone. A builder could choose a red brand, at
        which point a brand-colored element and an error state become indistinguishable. Meaning is carried by rings,
        checks, icons and text, which is also what WCAG 1.4.1 requires.
      </p>

      <H2 id="check">Check the pale case</H2>
      <p>
        Before calling a component done, view it under the Citrine example theme in Storybook. A pale brand is the
        case that breaks assumptions, and it is one click in the <strong>Brand</strong> toolbar.
      </p>

      <H2 id="dodont">Do and don’t</H2>
      <DoDont
        items={[
          { kind: 'do', text: 'Design against the unbranded default first.' },
          { kind: 'dont', text: 'Hardcode a hex for a brand color anywhere.' },
          { kind: 'do', text: 'Use semantic roles for anything brand-related.' },
          { kind: 'dont', text: 'Pair white with a brand fill.' },
          { kind: 'do', text: 'Check a component under both a light and a dark brand.' },
          { kind: 'dont', text: 'Use brand color as the only signal for state.' },
        ]}
      />
    </DocArticle>
  );
}
