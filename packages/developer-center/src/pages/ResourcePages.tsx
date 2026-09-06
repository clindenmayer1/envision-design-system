import { Callout, CodeBlock, Copyable, DocCard, DocGrid, SectionIntro } from '../modules';
import { ConcentricRings } from '../modules/artwork';
import { ScrollTable, TABLE_CELL } from '../modules/scales';
import { DocArticle, SectionLanding } from '../templates';
import { RESOURCE_ORDER, sectionNav } from './sections';
import { system } from '../data/generated';

const { seq, trail } = sectionNav(RESOURCE_ORDER, 'Resources', '/tools');

/** Single place a real Figma URL is added once the library is published. */
const FIGMA_DESTINATION: { published: boolean; url: string | null } = { published: false, url: null };

export function ResourcesLanding() {
  return (
    <SectionLanding
      trail={[{ label: 'Envision Design System', to: '/' }, { label: 'Tools and resources' }]}
      title="Tools and resources"
      media={<ConcentricRings />}
      lead="Where the actual tools, packages and libraries live, and what state each of them is in."
      related={[
        { title: 'Governance', to: '/governance', note: 'How these change.' },
        { title: 'Installation', to: '/get-started/installation', note: 'Getting the packages running.' },
        { title: 'Token reference', to: '/tokens/reference', note: 'The full token inventory.' },
      ]}
      next={{ title: 'Figma library', to: '/tools/figma' }}
      intro={
        <SectionIntro
          heading="Tools, by who needs them"
          body="Design tools produce the source. Development tools consume the output. System resources record what changed. Each entry states its real availability rather than implying everything is ready."
          cta={{ label: 'Browse code packages', to: '/tools/packages' }}
          visual={
            <div style={{ display: 'grid', gap: 'var(--dc-space-3)' }}>
              {[
                ['Design', ['Figma library', 'Icons', 'Templates']],
                ['Development', ['Storybook', 'Code packages', 'Design tokens']],
                ['System', ['Release notes', 'Changelog', 'Support']],
              ].map(([group, items]) => (
                <div key={group as string} style={{
                  padding: 'var(--dc-space-3) var(--dc-space-4)', borderRadius: 'var(--envision-t1-border-radius-10)',
                  background: 'var(--dc-surface)',
                  border: '1px solid var(--envision-t2-color-border-default-default)',
                }}>
                  <p style={{ margin: '0 0 var(--dc-space-4)' }}><envision-badge tone="brand" label={group as string} /></p>
                  <p className="dc-small" style={{ margin: 0 }}>{(items as string[]).join(' · ')}</p>
                </div>
              ))}
            </div>
          }
        />
      }
      grid={
        <>
          <h2 className="dc-h2" style={{ marginBlockStart: 0, fontSize: 'var(--envision-t1-font-size-24)' }}>Design</h2>
          <DocGrid columns={3}>
            <DocCard to="/tools/figma" title="Figma library">The design source. Not yet published.</DocCard>
            <DocCard to="/tools/icons" title="Icons">Inline system glyphs and consumer icons.</DocCard>
            <DocCard to="/tools/templates" title="Templates">What reusable scaffolding actually exists.</DocCard>
          </DocGrid>

          <h2 className="dc-h2" style={{ fontSize: 'var(--envision-t1-font-size-24)' }}>Development</h2>
          <DocGrid columns={3}>
            <DocCard href={system.storybookUrl} title="Storybook">The executable component reference.</DocCard>
            <DocCard to="/tools/packages" title="Code packages">{system.packages.length} workspace packages.</DocCard>
            <DocCard to="/tools/tokens" title="Design tokens">{system.counts.tokens} generated tokens.</DocCard>
          </DocGrid>

          <h2 className="dc-h2" style={{ fontSize: 'var(--envision-t1-font-size-24)' }}>System</h2>
          <DocGrid columns={3}>
            <DocCard to="/tools/releases" title="Release notes">Human-readable change summaries.</DocCard>
            <DocCard to="/tools/changelog" title="Changelog">Technical chronological history.</DocCard>
            <DocCard to="/tools/support" title="Support">Where to ask, and what exists today.</DocCard>
          </DocGrid>
        </>
      }
    />
  );
}

export function FigmaResource() {
  return (
    <DocArticle
      trail={trail('Figma library')}
      title="Figma library"
      lead="The design-side source of the Envision system."
      toc={[
        { id: 'status', label: 'Access status' },
        { id: 'contains', label: 'What it contains' },
        { id: 'relationship', label: 'Relationship to code' },
      ]}
      related={[
        { title: 'Figma variables', to: '/tokens/figma-variables', note: 'The architecture in detail.' },
        { title: 'Designers: getting started', to: '/get-started/designers', note: 'The design workflow.' },
        { title: 'Components', to: '/components', note: 'The code side.' },
      ]}
      {...seq('/tools/figma')}
    >
      <h2 className="dc-h2" id="status">Access status</h2>
      <Callout type="Important" title="The Envision Figma library is not published">
        The library exists and is used to author the system, but it has not been published, so it cannot be enabled in
        other files and the workflow cannot be verified from outside. No URL is offered here, because a link to an
        unpublished library would not work and a fabricated one would be worse.
      </Callout>
      {FIGMA_DESTINATION.published && FIGMA_DESTINATION.url && (
        <p><a href={FIGMA_DESTINATION.url} target="_blank" rel="noreferrer">Open the Envision library ↗</a></p>
      )}
      <p className="dc-small">
        The destination is configured in one place in this site's source, so a real link can be added centrally once
        publishing happens rather than being scattered across pages.
      </p>

      <h2 className="dc-h2" id="contains">What it contains</h2>
      <p>
        Variable collections mirroring the four token layers plus a responsive collection, and component sets
        corresponding to the registry. {system.counts.public} components are registered in total;{' '}
        {system.counts.implemented} of those are implemented in code.
      </p>

      <h2 className="dc-h2" id="relationship">Relationship to code</h2>
      <p>
        A reference, not a sync. A Figma variable and a CSS custom property name the same decision; the token build
        carries the value from source into implementation formats. Full detail is on{' '}
        <a href="/tokens/figma-variables">Figma variables</a>.
      </p>
    </DocArticle>
  );
}

export function StorybookResource() {
  return (
    <DocArticle
      trail={trail('Storybook')}
      title="Storybook"
      lead="The executable component reference, deployed and live."
      actions={
        <a href={system.storybookUrl} target="_blank" rel="noreferrer" style={{
          display: 'inline-flex', alignItems: 'center', gap: 'var(--dc-space-2)', padding: 'var(--dc-space-3) var(--dc-space-4)', textDecoration: 'none',
          fontSize: 'var(--envision-t1-font-size-14)', fontWeight: 'var(--envision-t1-font-weight-600)',
          border: '1px solid var(--envision-t2-color-border-strong-default)',
          borderRadius: 'var(--envision-t2-border-radius-container-md)',
        }}>Open Envision Storybook ↗</a>
      }
      toc={[
        { id: 'what', label: 'What it contains' },
        { id: 'use', label: 'What to use it for' },
        { id: 'boundary', label: 'Relationship to this site' },
      ]}
      related={[
        { title: 'Storybook guide', to: '/get-started/storybook', note: 'How to use it.' },
        { title: 'Components', to: '/components', note: 'The guidance half.' },
        { title: 'Installation', to: '/get-started/installation', note: 'Running components yourself.' },
      ]}
      {...seq('/tools/storybook')}
    >
      <h2 className="dc-h2" id="what">What it contains</h2>
      <p>
        The real production components from <code>@envision/components</code> rendered with the real production tokens,
        plus foundations pages and a token explorer. {system.counts.withStorybook} components have built documentation
        pages.
      </p>
      <p><Copyable text={system.storybookUrl} /></p>

      <h2 className="dc-h2" id="use">What to use it for</h2>
      <ul>
        <li>Exercising every supported state through controls.</li>
        <li>Reading the component API.</li>
        <li>Inspecting rendered markup and computed tokens.</li>
        <li>Running the accessibility checker against a story.</li>
      </ul>

      <h2 className="dc-h2" id="boundary">Relationship to this site</h2>
      <p>
        Envision Design answers which component and why. Storybook answers what it can do. Every component page
        here links to its Storybook page, and those links are generated from the built Storybook index rather than
        hand-maintained.
      </p>
    </DocArticle>
  );
}

export function TokensResource() {
  return (
    <DocArticle
      trail={trail('Design tokens')}
      title="Design tokens"
      lead="Where the token source, the generated output and the documentation each live."
      toc={[
        { id: 'source', label: 'Source' },
        { id: 'output', label: 'Generated output' },
        { id: 'docs', label: 'Documentation' },
      ]}
      related={[
        { title: 'Token architecture', to: '/tokens/architecture', note: 'How the layers work.' },
        { title: 'Token reference', to: '/tokens/reference', note: 'Every token.' },
        { title: 'Token pipeline', to: '/tokens/pipeline', note: 'Source to product.' },
      ]}
      {...seq('/tools/tokens')}
    >
      <h2 className="dc-h2" id="source">Source</h2>
      <p>Five DTCG-compatible files, edited by hand, in <code>packages/tokens/src/</code>.</p>
      <ScrollTable head={['File', 'Holds']}>
        {[
          ['primitives.tokens.json', 'Raw ramps, scales, durations, breakpoints'],
          ['brand.tokens.json', 'Envision identity decisions'],
          ['semantic.tokens.json', 'Roles: content, background, border, spacing, layout, elevation'],
          ['components.tokens.json', 'Per-component values'],
          ['responsive.tokens.json', 'Tokens carrying responsive extensions'],
        ].map((r) => (
          <tr key={r[0]}><td style={TABLE_CELL}><code>{r[0]}</code></td><td style={TABLE_CELL}>{r[1]}</td></tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="output">Generated output</h2>
      <p>Six files in <code>packages/tokens/dist/</code>. Never edit these.</p>
      <CodeBlock language="ts" filename="Entry points" code={`import '@envision/tokens/css';            // all tiers\nimport '@envision/tokens/css/primitives';\nimport '@envision/tokens/css/semantic';\nimport '@envision/tokens/css/components';\nimport '@envision/tokens/css/responsive';\nimport { EnvisionT2ColorBackgroundBrandDefault } from '@envision/tokens';`} />

      <h2 className="dc-h2" id="docs">Documentation</h2>
      <DocGrid columns={3}>
        <DocCard to="/tokens/architecture" title="Architecture">The four layers.</DocCard>
        <DocCard to="/tokens/pipeline" title="Pipeline">Design source to product.</DocCard>
        <DocCard to="/tokens/reference" title="Reference">All {system.counts.tokens} tokens.</DocCard>
      </DocGrid>
    </DocArticle>
  );
}

export function PackagesResource() {
  return (
    <DocArticle
      trail={trail('Code packages')}
      title="Code packages"
      lead="Every package in the Envision workspace, generated from the manifests."
      toc={[
        { id: 'packages', label: 'The packages' },
        { id: 'install', label: 'Installation' },
        { id: 'exports', label: 'Important exports' },
      ]}
      related={[
        { title: 'Installation', to: '/get-started/installation', note: 'Getting them running.' },
        { title: 'Versioning', to: '/governance/versioning', note: 'How versions change.' },
        { title: 'Components', to: '/components', note: 'What the packages contain.' },
      ]}
      {...seq('/tools/packages')}
    >
      <h2 className="dc-h2" id="packages">The packages</h2>
      <ScrollTable head={['Package', 'Version', 'Published', 'Purpose']}>
        {system.packages.map((p) => (
          <tr key={p.name}>
            <td style={TABLE_CELL}><Copyable text={p.name} /></td>
            <td style={TABLE_CELL}>{p.version}</td>
            <td style={TABLE_CELL}>{p.private ? <span className="dc-small">Private</span> : 'Public'}</td>
            <td style={TABLE_CELL}>{p.description ?? <span className="dc-small">No description in manifest</span>}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="install">Installation</h2>
      <Callout type="Important" title="No registry install exists">
        Every package is <code>private: true</code> at <code>0.1.0</code>. They are consumed as workspace
        dependencies, not installed from a registry. An <code>npm install</code> command would look authoritative and
        fail.
      </Callout>
      <CodeBlock language="json" filename="your-app/package.json" code={`{\n  "dependencies": {\n    "@envision/components": "*",\n    "@envision/tokens": "*"\n  }\n}`} />

      <h2 className="dc-h2" id="exports">Important exports</h2>
      <ScrollTable head={['Package', 'Entry', 'Effect']}>
        {[
          ['@envision/tokens', './css', 'Declares every custom property on :root'],
          ['@envision/tokens', '.', 'Named TypeScript exports with resolved values'],
          ['@envision/components', '.', 'Registers every <envision-*> element as a side effect'],
          ['@envision/components', './define', 'Selective registration'],
          ['@envision/react', '.', 'React adapter; React 18 or 19 as a peer'],
        ].map((r, i) => (
          <tr key={i}>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{r[0]}</code></td>
            <td style={TABLE_CELL}><code>{r[1]}</code></td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
    </DocArticle>
  );
}

export function IconsResource() {
  return (
    <DocArticle
      trail={trail('Icons')}
      title="Icons"
      lead="Where Envision icons come from and how to use them. Design guidance lives in Foundations; this page is about access."
      toc={[
        { id: 'sources', label: 'Two sources' },
        { id: 'using', label: 'Using an icon' },
        { id: 'font', label: 'Loading the font' },
      ]}
      related={[
        { title: 'Iconography', to: '/foundations/iconography', note: 'Style and usage guidance.' },
        { title: 'IconButton', to: '/components/iconbutton', note: 'The icon-only control.' },
        { title: 'Accessibility', to: '/accessibility/screen-readers', note: 'Naming icon controls.' },
      ]}
      {...seq('/tools/icons')}
    >
      <h2 className="dc-h2" id="sources">Two sources</h2>
      <ScrollTable head={['Source', 'Used for', 'Needs a font?', 'Location']}>
        {[
          ['Inline SVG', 'Glyphs a component draws for itself', 'No', 'packages/components/src/base/icons.ts'],
          ['Material Symbols', 'Icons a consumer passes in', 'Yes, loaded by the host', 'The host application'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
            <td style={TABLE_CELL}><code style={{ fontSize: 'var(--envision-t1-font-size-11)' }}>{r[3]}</code></td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        The split exists because of a real failure: ligature names rendered as literal words in hosts that had not
        loaded the font. Component-owned glyphs now ship with the component.
      </p>

      <h2 className="dc-h2" id="using">Using an icon</h2>
      <CodeBlock language="html" code={`<envision-button variant="primary" label="New design" leading-icon="add"></envision-button>\n<envision-icon-button icon="tune" accessible-name="Adjust settings"></envision-icon-button>`} />
      <p>Icon names are Material Symbols names. There is no Envision icon catalog: the set is whatever the host loads.</p>

      <h2 className="dc-h2" id="font">Loading the font</h2>
      <p>
        If you pass icon names, the host application must load Material Symbols. Without it the ligature renders as its
        literal name. Component-owned glyphs are unaffected.
      </p>
    </DocArticle>
  );
}

export function TemplatesResource() {
  return (
    <DocArticle
      trail={trail('Templates')}
      title="Templates"
      lead="Reusable scaffolding that genuinely exists in this repository, and an honest account of what does not."
      toc={[
        { id: 'code', label: 'Documentation templates in code' },
        { id: 'proposal', label: 'Proposal templates' },
        { id: 'missing', label: 'What does not exist' },
      ]}
      related={[
        { title: 'Requesting a component', to: '/governance/requesting-a-component', note: 'The proposal fields.' },
        { title: 'Design review', to: '/governance/design-review', note: 'The review checklist.' },
        { title: 'Contribution model', to: '/governance/contribution', note: 'The whole process.' },
      ]}
      {...seq('/tools/templates')}
    >
      <h2 className="dc-h2" id="code">Documentation templates in code</h2>
      <p>
        The reusable templates that exist are code, not downloadable files. They are what every page on this site is
        built from.
      </p>
      <ScrollTable head={['Template', 'Used for']}>
        {[
          ['SectionLanding', 'Every section landing page'],
          ['DocArticle', 'Every long-form article'],
          ['ComponentPage', 'Generated component documentation'],
          ['ProductExample', 'Annotated product compositions'],
          ['ResponsiveExample', 'Desktop, tablet and mobile sequences'],
          ['DoDont', 'Decision comparisons'],
          ['ProcessDiagram', 'Multi-stage processes'],
          ['ArchitectureDiagram', 'Source, generated and consumer maps'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}><code>{r[0]}</code></td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="proposal">Proposal and review templates</h2>
      <p>
        The component proposal fields and the three review checklists are documented as structured content in
        Governance rather than as downloadable documents. They are usable by copying the field list.
      </p>

      <h2 className="dc-h2" id="missing">What does not exist</h2>
      <Callout type="Important" title="No downloadable template files">
        There is no Figma page template, no document template and no checklist file in this repository. Listing them
        as available resources would be advertising something that cannot be downloaded.
      </Callout>
    </DocArticle>
  );
}

export function ReleasesResource() {
  return (
    <DocArticle
      trail={trail('Release notes')}
      title="Release notes"
      lead="Human-readable summaries of what changed in each release, written for people consuming the system."
      toc={[
        { id: 'status', label: 'Current status' },
        { id: 'shape', label: 'What a release note contains' },
        { id: 'vs', label: 'Release notes versus changelog' },
      ]}
      related={[
        { title: 'Changelog', to: '/tools/changelog', note: 'The technical history.' },
        { title: 'Releases', to: '/governance/releases', note: 'How releases happen.' },
        { title: 'Versioning', to: '/governance/versioning', note: 'What the numbers mean.' },
      ]}
      {...seq('/tools/releases')}
    >
      <h2 className="dc-h2" id="status">Current status</h2>
      <Callout type="Important" title="No published release notes are currently available">
        Every package sits at <code>0.1.0</code> and none has been published. There is no release history to present,
        and inventing one would misrepresent the system's maturity. This page describes the intended shape so it is
        ready when the first release happens.
      </Callout>

      <h2 className="dc-h2" id="shape">What a release note contains</h2>
      <ScrollTable head={['Section', 'Answers']}>
        {[
          ['Version and date', 'Which release is this?'],
          ['Summary', 'Should I care about this one?'],
          ['New', 'What can I now do?'],
          ['Changed', 'What behaves differently?'],
          ['Fixed', 'What was broken?'],
          ['Deprecated', 'What should I stop using?'],
          ['Migration', 'What must I do to adopt this?'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="vs">Release notes versus changelog</h2>
      <p>
        Release notes are written for consumers and explain impact: what this means for you and whether you need to do
        anything. A changelog is chronological and technical, listing what changed regardless of whether it affects
        anyone.
      </p>
    </DocArticle>
  );
}

export function ChangelogResource() {
  return (
    <DocArticle
      trail={trail('Changelog')}
      title="Changelog"
      lead="A chronological technical record of changes to the system."
      toc={[
        { id: 'status', label: 'Current status' },
        { id: 'vs', label: 'How this differs from release notes' },
        { id: 'shape', label: 'Intended shape' },
      ]}
      related={[
        { title: 'Release notes', to: '/tools/releases', note: 'Consumer-facing summaries.' },
        { title: 'Releases', to: '/governance/releases', note: 'The release process.' },
        { title: 'Deprecation', to: '/governance/deprecation', note: 'How removals are communicated.' },
      ]}
      {...seq('/tools/changelog')}
    >
      <h2 className="dc-h2" id="status">Current status</h2>
      <Callout type="Important" title="No changelog data exists in this repository">
        There is no <code>CHANGELOG.md</code> and no published release history. The repository has commit history, but
        commits are not a changelog: presenting them as curated entries would fabricate a record that was never
        maintained.
      </Callout>

      <h2 className="dc-h2" id="vs">How this differs from release notes</h2>
      <ScrollTable head={['', 'Changelog', 'Release notes']}>
        {[
          ['Audience', 'Contributors and maintainers', 'Consumers of the system'],
          ['Organized by', 'Date and version', 'Version and impact'],
          ['Includes', 'Every change', 'Changes that affect consumers'],
          ['Answers', 'What changed?', 'What must I do?'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>

      <h2 className="dc-h2" id="shape">Intended shape</h2>
      <p>
        Grouped by version, then by area: components, tokens, foundations, documentation. Each entry states what
        changed and links to the change. Filterable by area once there is enough history to be worth filtering.
      </p>
    </DocArticle>
  );
}

export function SupportResource() {
  return (
    <DocArticle
      trail={trail('Support')}
      title="Support"
      lead="Where to take a question, a bug, or a request. This page lists only what actually exists."
      toc={[
        { id: 'status', label: 'What exists today' },
        { id: 'routes', label: 'Where to take each thing' },
        { id: 'include', label: 'What to include' },
      ]}
      related={[
        { title: 'Contribution model', to: '/governance/contribution', note: 'The full process.' },
        { title: 'Requesting a component', to: '/governance/requesting-a-component', note: 'The proposal fields.' },
        { title: 'Proposing a change', to: '/governance/proposing-a-change', note: 'Change types and review.' },
      ]}
      {...seq('/tools/support')}
    >
      <h2 className="dc-h2" id="status">What exists today</h2>
      <Callout type="Important" title="No dedicated support channel is recorded">
        There is no Slack channel, mailing list, issue template or named maintainer rota recorded in this repository.
        Rather than invent contacts, the routes below point at the repository and at the governance processes that do
        exist.
      </Callout>

      <h2 className="dc-h2" id="routes">Where to take each thing</h2>
      <ScrollTable head={['You want to', 'Route', 'Why']}>
        {[
          ['Ask how something works', 'This documentation, then the repository', 'Most answers are documented; if not, that is a documentation gap worth raising'],
          ['Report a bug', 'The repository', 'A component not behaving as documented is the cheapest, most useful report'],
          ['Request a component', 'Requesting a component', 'The proposal fields are documented there'],
          ['Propose a change', 'Proposing a change', 'Change type determines the review needed'],
          ['Report a documentation issue', 'The repository', 'Documentation corrections need no design review'],
        ].map((r) => (
          <tr key={r[0]}>
            <td style={{ ...TABLE_CELL, fontWeight: 600 }}>{r[0]}</td>
            <td style={TABLE_CELL}>{r[1]}</td>
            <td style={TABLE_CELL}>{r[2]}</td>
          </tr>
        ))}
      </ScrollTable>
      <p>
        <a href="https://github.com/clindenmayer1/envision-design-system" target="_blank" rel="noreferrer">
          Envision repository ↗
        </a>
      </p>

      <h2 className="dc-h2" id="include">What to include</h2>
      <ul>
        <li>What you were trying to do, and what happened instead.</li>
        <li>Which component or token, by its exact name.</li>
        <li>Where it happened: a product surface, Storybook, or this documentation.</li>
        <li>For a bug, the difference between documented and actual behavior.</li>
        <li>For a request, evidence that the need appears in more than one place.</li>
      </ul>
    </DocArticle>
  );
}
