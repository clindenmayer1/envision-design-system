import { DocCard, DocGrid, SectionIntro } from '../modules';
import { DotsSphere } from '../modules/artwork';
import { LayerStack } from '../modules/diagrams';
import { SectionLanding } from '../templates';

/**
 * The Design Tokens overview.
 *
 * /tokens used to redirect straight to /tokens/architecture, which left the Design language tab as
 * the one tab that never landed anywhere. It lands here now, and this page follows the same rule
 * every other section overview does: it covers ITS OWN section and nothing else. An earlier draft
 * of this page listed the sibling sections of the area instead — theming, content, accessibility —
 * which made it the only overview on the site describing something other than the section it sits
 * in, and made the sidebar row read as Design Tokens > Overview while the page said otherwise.
 */
export function TokensLanding() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Design Tokens' }]}
      title="Design Tokens"
      lead="Every design decision in the system, written as a named token rather than a value. Four tiers, one direction of reference, and a build that turns the same source into CSS and TypeScript."
      media={<DotsSphere />}
      intro={
        <SectionIntro
          heading="A decision with a name, not a value."
          body="A value is precise and useless six months later. A token records which places are the same decision, so changing it is one edit and a reviewer can tell whether a screen is following the system or improvising."
          cta={{ label: 'Read the architecture', to: '/tokens/architecture' }}
          visual={
            <LayerStack
              alt={
                'Four token layers, top to bottom: Primitive holds raw values, Brand assigns identity to them, ' +
                'Semantic assigns a role, and Component scopes values to a single component. Each layer may ' +
                'reference the one above it and never the one below.'
              }
              layers={[
                { label: 'Primitive', tone: 'neutral', note: 'Raw values, with no meaning attached.' },
                { label: 'Brand', tone: 'warm', note: 'Identity assigned to those values.' },
                { label: 'Semantic', tone: 'info', note: 'A role: a brand background, a border.' },
                { label: 'Component', tone: 'active', note: 'Scoped to one component.' },
              ]}
            />
          }
        />
      }
      grid={
        <DocGrid columns={3}>
          <DocCard to="/tokens/architecture" title="Token architecture" cta="Read the architecture">
            The four tiers, who consumes each, and one decision followed all the way to a component.
          </DocCard>
          <DocCard to="/tokens/naming" title="Naming conventions" cta="See the grammar">
            How a token name is built, so a name can be predicted rather than looked up.
          </DocCard>
          <DocCard to="/tokens/pipeline" title="Token pipeline" cta="See the build">
            Figma variables to DTCG to Style Dictionary to the CSS and TypeScript that ship.
          </DocCard>
          <DocCard to="/tokens/using-tokens" title="Using tokens" cta="See the rules">
            Which tier to reach for in a component, and what to do when none of them fits.
          </DocCard>
          <DocCard to="/tokens/figma-variables" title="Figma variables" cta="See the mapping">
            How the design source and the generated output stay the same set of decisions.
          </DocCard>
          <DocCard to="/tokens/reference" title="Token reference" cta="Browse every token">
            The full generated list, searchable, with the resolved value of each one.
          </DocCard>
        </DocGrid>
      }
      related={[
        { title: 'Theming', to: '/theming', note: 'Re-pointing tokens for another builder.' },
        { title: 'Components', to: '/components', note: 'Where the tokens are consumed.' },
      ]}
      next={{ title: 'Token architecture', to: '/tokens/architecture' }}
    />
  );
}
