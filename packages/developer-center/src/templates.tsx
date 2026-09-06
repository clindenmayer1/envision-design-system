import { PageHeader, PrevNext, RelatedGuidance, type MetaField } from './modules';
import { TableOfContents } from './modules/diagrams';

/**
 * Canonical page templates (Part 3 of the audit brief).
 *
 * Seven benchmark pages were built first, which risked seven unrelated layouts. Everything now
 * routes through two templates plus the generated component page:
 *
 *   Template A  Homepage                      pages/Home.tsx (one instance, intentionally bespoke)
 *   Template B  Section landing               SectionLanding, below
 *   Template C  Standard documentation        DocArticle
 *   Template D  Technical / architecture      DocArticle
 *   Template E  Component documentation       pages/Components.tsx (generated from the registry)
 *   Template F  Pattern documentation         DocArticle
 *   Template G  Governance / process          DocArticle
 *
 * C, D, F and G are the same structural template. They differ in content, not in layout, which is
 * the point: a reader should not have to relearn the page when moving between sections.
 */

interface TrailItem { label: string; to?: string }
interface TocItem { id: string; label: string; level?: 2 | 3 }
interface LinkItem { title: string; to: string; note?: string }

/**
 * Template B: a section landing page.
 *
 * Fixed order per Part XXII: breadcrumb, H1, section definition, large educational module, primary
 * grid, deeper educational content, related ecosystem links, previous/next. No table of contents:
 * a landing page is a directory, and a second navigation column competes with the grid.
 */
export function SectionLanding({
  trail, title, lead, intro, grid, children, related, prev, next, media,
}: {
  trail: TrailItem[];
  title: string;
  lead: string;
  /** The section's mark. Passed straight to PageHeader, which turns the header into the banner. */
  media?: React.ReactNode;
  intro: React.ReactNode;
  grid: React.ReactNode;
  /** The deeper educational section. */
  children?: React.ReactNode;
  related?: LinkItem[];
  prev?: { title: string; to: string };
  next?: { title: string; to: string };
}) {
  return (
    <div className="dc-container">
      <PageHeader trail={trail} title={title} lead={lead} media={media} />
      {intro}
      <section style={{ marginBlockStart: 'var(--dc-space-16)' }}>{grid}</section>
      {children}
      {related && <RelatedGuidance links={related} />}
      {(prev || next) && <PrevNext prev={prev} next={next} />}
    </div>
  );
}

/**
 * Templates C, D, F and G: a documentation article with a sticky table of contents.
 *
 * The TOC, related guidance and previous/next are supplied by the template rather than repeated per
 * page, so every article ends the same way and none can forget one of them.
 */
export function DocArticle({
  trail, title, lead, meta, actions, toc, children, related, prev, next,
}: {
  trail: TrailItem[];
  title: string;
  lead: React.ReactNode;
  meta?: MetaField[];
  actions?: React.ReactNode;
  toc: TocItem[];
  children: React.ReactNode;
  related: LinkItem[];
  prev?: { title: string; to: string };
  next?: { title: string; to: string };
}) {
  return (
    <div className="dc-container">
      <div className="dc-article-layout">
        <article className="dc-article">
          <PageHeader trail={trail} title={title} lead={lead} meta={meta} actions={actions} />
          {children}
          <RelatedGuidance links={related} />
          <PrevNext prev={prev} next={next} />
        </article>
        <TableOfContents items={toc} />
      </div>
    </div>
  );
}

/**
 * Template E: the component page.
 *
 * The same article body and sticky contents as Template C, opened by a full-width header band that
 * carries the title and a tab bar on its lower edge. It lives here rather than in the page file for
 * the same reason the others do: the shell is a system decision, and a page that hand-rolls one can
 * drift from every other page without anyone noticing.
 */
export function ComponentArticle({
  band, children, toc, related, prev, next,
}: {
  /** Header band content: page header plus the tab bar. */
  band: React.ReactNode;
  children: React.ReactNode;
  toc: TocItem[];
  related: LinkItem[];
  prev?: { title: string; to: string };
  next?: { title: string; to: string };
}) {
  return (
    <>
      <header className="dc-comp-hero">
        <div className="dc-comp-hero-inner">{band}</div>
      </header>
      <div className="dc-container dc-comp-body">
        <div className="dc-article-layout">
          <article className="dc-article">
            {children}
            <RelatedGuidance links={related} />
              <PrevNext prev={prev} next={next} />
          </article>
          <TableOfContents items={toc} />
        </div>
      </div>
    </>
  );
}

/** Section heading that registers with the table of contents. Keeps ids and labels in one place. */
export function H2({ id, children }: { id: string; children: React.ReactNode }) {
  return <h2 className="dc-h2" id={id}>{children}</h2>;
}
