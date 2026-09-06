import { Link } from 'react-router-dom';
import { Callout, DocCard, DocGrid, LivePreview, SectionIntro } from '../modules';
import { DnaHelix } from '../modules/artwork';
import { LayerStack, Pipeline } from '../modules/diagrams';
import { ScrollTable, TABLE_CELL, tokenCount } from '../modules/scales';
import { DesignCenterRail, ProductExample } from '../modules/product';
import { SectionLanding } from '../templates';
import { FoundationsComposition } from './visuals';

/**
 * Foundations section landing page.
 *
 * This is the benchmark implementation of the section-landing template (Part XXII): breadcrumb,
 * title, one-sentence definition, a large educational module, the category grid, one deeper
 * educational section, related links, previous/next. Every other section landing reuses this shape
 * rather than re-inventing a layout.
 */
export function Foundations() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Foundations' }]}
      title="Foundations"
      media={<DnaHelix />}
      lead="Foundations are the decisions every Envision component inherits. They are the smallest unit of shared judgment in the system: settle them once, and every screen that follows is consistent by construction rather than by review."
      related={[
        { title: 'Token architecture', to: '/tokens/architecture', note: 'How a foundation becomes a value in code.' },
        { title: 'Components', to: '/components', note: 'What consumes these decisions.' },
        { title: 'Accessibility', to: '/accessibility', note: 'The constraints foundations must satisfy.' },
      ]}
      next={{ title: 'Color', to: '/foundations/color' }}
      intro={
        <SectionIntro
          heading="Start with the fundamentals"
          body="Foundations define the visual and behavioral language shared across Envision. They establish the decisions that components and patterns build upon."
          cta={{ label: 'Explore foundations', to: '/foundations/color' }}
          visual={<FoundationsComposition />}
        />
      }
      grid={
        <>
          <DocGrid columns={4}>
          <DocCard to="/foundations/color" title="Color">
            Semantic roles that carry meaning, not a palette of favorites.
          </DocCard>
          <DocCard to="/foundations/typography" title="Typography">
            The type scale, hierarchy and reading measure used across the product.
          </DocCard>
          <DocCard to="/foundations/spacing" title="Spacing">
            An 8pt rhythm that encodes how closely related two things are.
          </DocCard>
          <DocCard to="/foundations/layout-grid" title="Layout &amp; grid">
            Page canvas, containers, the right rail, and readable width.
          </DocCard>
          <DocCard to="/foundations/radius" title="Radius">
            How corner treatment signals the difference between a control and a container.
          </DocCard>
          <DocCard to="/foundations/iconography" title="Iconography">
            Material Symbols usage, sizing, and when an icon needs an accessible name.
          </DocCard>
          <DocCard to="/foundations/responsive-design" title="Responsive design">
            Adapting a layout to a context rather than shrinking it.
          </DocCard>
          <DocCard tone="accent" to="/patterns/selection" title="See foundations in action">
            Follow one real Envision workflow and watch every foundation appear in it.
          </DocCard>
        </DocGrid>

        <p className="dc-small" style={{ marginBlockStart: 'var(--dc-space-6)' }}>
          Also in foundations:{' '}
          {[
            ['Breakpoints', '/foundations/breakpoints'],
            ['Elevation &amp; shadows', '/foundations/elevation-shadows'],
            ['Motion', '/foundations/motion'],
            ['Imagery', '/foundations/imagery'],
          ].map(([label, to], i, a) => (
            <span key={to}>
              <Link to={to}>{label.replace('&amp;', '&')}</Link>
              {i < a.length - 1 ? ', ' : ''}
            </span>
          ))}
        </p>
        </>
      }
    >
      {/* ------------------------------------------------ deeper educational section */}
      <section>
        <h2 className="dc-h2" id="what-counts">What counts as a foundation?</h2>
        <p>
          A decision belongs in foundations when it is used by more than one component and changing it would change
          the feel of the whole product. Color, type, spacing and radius qualify. The padding inside a single card
          does not: that is a component decision, and it should be expressed as a component token that references a
          foundation rather than as a new foundation of its own.
        </p>
        <p>
          The test is direction of dependency. Foundations do not know which components exist. Components know exactly
          which foundations they consume. If a proposed foundation has to mention a component by name in order to be
          explained, it is not a foundation yet.
        </p>

        <LayerStack
          alt={
            'A four-layer stack. Foundations sit at the base and are consumed by everything above them. Tokens sit ' +
            'above foundations and encode those decisions as data. Components sit above tokens and consume them. ' +
            'Patterns sit at the top and combine components. Each layer depends only on the layers beneath it.'
          }
          caption="Dependency runs one way. A component may consume a foundation; a foundation never depends on a component."
          layers={[
            { label: 'Patterns', note: 'Combine components to solve a recurring problem', tone: 'neutral' },
            { label: 'Components', note: 'Consume tokens, never raw values', tone: 'neutral' },
            { label: 'Tokens', note: 'Foundations encoded as data', tone: 'abstract' },
            { label: 'Foundations', note: 'The shared decisions everything inherits', tone: 'active' },
          ]}
        />

        <h3 className="dc-h3" id="foundations-and-tokens">Foundations and tokens are not the same thing</h3>
        <p>
          A foundation is the decision. A token is that decision made portable. Envision decided that the brand action
          color is a deep green; that is the foundation. <code>--envision-t2-color-background-brand-default</code> is
          the token that carries the decision into code, and it is what a component actually references.
        </p>
        <p>
          The distinction matters when something changes. Adjusting the green is a token edit that propagates
          everywhere automatically. Deciding that Envision should no longer lead with green at all is a foundation
          change, and it requires the reasoning on the Color page to be rewritten before any token moves.
        </p>

        <Callout type="Designer" title="Where this lands in Figma">
          Foundations map to variable collections in the Envision Figma library, not to components. If you find
          yourself detaching an instance to change a color, the decision you want is almost certainly a foundation
          that already exists as a variable.
        </Callout>

        <h3 className="dc-h3" id="using-guidance">How to use foundation guidance</h3>
        <p>
          Read a foundation page before you need it, not while you are arguing about a specific screen. Each page moves
          from concept to decision to application to implementation, so a designer can stop after the decision section
          and an engineer can start at implementation. Both halves describe the same rule.
        </p>
      </section>

      {/* Absorbed from the former /foundations/overview, which repeated this page title. */}
      <section>
        <h2 className="dc-h2" id="what">What foundations are</h2>
        <p>
          A foundation is a decision made once, at system level, that everything downstream inherits. Envision has
          eleven: color, typography, spacing, layout, responsive behavior, breakpoints, radius, elevation, iconography,
          motion and imagery.
        </p>
        <p>
          They are decisions, not assets. “Selection is signaled by a ring and a check, never by color” is a foundation.
          The green used for the ring is a value that expresses it, and the value can change without the decision moving.
        </p>

        <h2 className="dc-h2" id="why">Why foundations exist</h2>
        <p>
          Without them, every component and every screen decides for itself. That is not a hypothetical: it is the normal
          outcome, and it produces six subtly different greens, four gap sizes that all mean “related”, and a product that
          feels assembled rather than designed.
        </p>
        <p>
          A foundation removes the decision from the screen. Once “what does a gap of 8 mean” is settled, no screen has to
          answer it again, and no reviewer has to catch it when a screen answers it differently.
        </p>
        <Pipeline
          alt={
            'A foundation decision is encoded as a token, which is consumed by a component, which is composed into a ' +
            'pattern, which appears in the product. Accessibility and Content apply across all of these rather than ' +
            'sitting at one stage.'
          }
          caption="One direction of travel. Accessibility and Content are constraints on every stage, not a stage of their own."
          steps={[
            { label: 'Foundation', note: 'The decision', tone: 'active' },
            { label: 'Token', note: 'Encoded as data', tone: 'abstract' },
            { label: 'Component', note: 'Consumes the token', tone: 'abstract' },
            { label: 'Pattern', note: 'Composes components', tone: 'neutral' },
            { label: 'Product', note: 'Real Envision workflows', tone: 'neutral' },
          ]}
        />

        <h2 className="dc-h2" id="tokens">Foundations and tokens</h2>
        <p>These are constantly conflated and are not the same thing.</p>
        <ScrollTable head={['', 'Foundation', 'Token']}>
          {[
            ['Is', 'The design rule', 'The named data representing it'],
            ['Lives in', 'This documentation', 'The token source and generated output'],
            ['Example', 'Spacing communicates relationship: closer means more related', `${tokenCount('--envision-t1-spacing-')} spacing steps, from 0 to 64`],
            ['Changing it', 'Rewrites the guidance and probably the tokens', 'Propagates automatically to every consumer'],
          ].map((r) => (
            <tr key={r[0]}>
              <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
              <td style={TABLE_CELL}>{r[1]}</td>
              <td style={TABLE_CELL}>{r[2]}</td>
            </tr>
          ))}
        </ScrollTable>
        <p>
          The distinction matters when something needs to change. Adjusting a spacing value is a token edit. Deciding that
          Envision should stop using proximity to signal grouping is a foundation change, and the tokens are the last part
          of that work, not the first.
        </p>

        <h2 className="dc-h2" id="components">Foundations and components</h2>
        <p>
          Components consume foundations; they do not define their own visual systems. Button does not decide what its
          brand color is, what radius a control takes, or how much padding means “comfortable”. It references decisions
          that already exist.
        </p>
        <LivePreview caption="Button, consuming color, radius, spacing and typography foundations at once. None are its own.">
          <envision-button variant="primary" label="Apply design" />
          <envision-button variant="outline" label="Explore components" />
        </LivePreview>

        <h2 className="dc-h2" id="patterns">Foundations and patterns</h2>
        <p>
          A pattern composes components, and inherits their foundations unchanged. The Selection pattern does not
          introduce new spacing or a new selected color; it decides which components appear, in what order, and what
          happens between them.
        </p>
        <p>
          If a pattern needs a value no foundation provides, that is a signal the foundation is incomplete, not license
          for the pattern to invent one.
        </p>

        <h2 className="dc-h2" id="product">Foundations and product</h2>
        <p>
          One foundation decision surfaces in many places at once. The rule that interface color stays quiet next to
          product material is visible in the rail, in a finish group, and in every swatch grid in the product.
        </p>
        <ProductExample
          title="Design Center · right rail"
          surface={<DesignCenterRail />}
          annotations={[
            'Color: one green, on the commit action only.',
            'Spacing: the same scale separates rows and groups the footer.',
            'Radius: controls and containers take different values, so they read as different things.',
            'Typography: one scale carries the hierarchy from heading to cost delta.',
          ]}
          caption="Four foundations, one surface. None of them are decided here."
        />

        <h2 className="dc-h2" id="using">How to use this guidance</h2>
        <p>
          <strong>Designers:</strong> read the intent before the values. Bind to variables rather than imitating a look;
          a value that matches by eye but references nothing will drift the first time the system moves.
        </p>
        <p>
          <strong>Engineers:</strong> consume semantic or component tokens, never raw values, and use the real components
          rather than rebuilding their surface. Every foundation on this page is already expressed in code.
        </p>
      </section>
    </SectionLanding>
  );
}
