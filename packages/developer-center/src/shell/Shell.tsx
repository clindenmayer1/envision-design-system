import { useEffect, useMemo, useRef, useState, type CSSProperties } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { AREAS, TOOLS, areaFor, sectionPages, type NavPage, type NavSection } from '../data/nav';
import { Search } from './Search';
import { Logo } from './Logo';

/**
 * The global shell: fixed left navigation, top utility bar with search, and the content region.
 *
 * Navigation runs on two axes. The top bar chooses an AREA, which is a whole shelf of the system,
 * and the sidebar then draws only that area's sections. Nothing else is listed, so the reader is
 * never scrolling past six areas of tree to reach the one they are in.
 *
 * Within the sidebar, the ACTIVE section expands by default and each section's chevron can collapse
 * it or open another for a look, which is the reader's call rather than ours. Indentation never
 * exceeds three levels.
 */
export function Shell({ children }: { children: React.ReactNode }) {
  const { pathname } = useLocation();
  const area = areaFor(pathname);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const navRef = useRef<HTMLElement>(null);

  // Close the mobile drawer on navigation, and send focus to the content so keyboard and screen
  // reader users are not left at the top of a closed drawer.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  /**
   * The mobile drawer is a modal surface, so it implements the focus contract this site documents
   * on the Focus management page: focus moves in on open, Tab is trapped while it is open, Escape
   * closes it, and focus returns to the trigger. Documenting that contract while not honoring it
   * would be the clearest possible failure of Part XLIX.
   */
  useEffect(() => {
    if (!drawerOpen) return;
    const nav = navRef.current;
    const opener = document.activeElement as HTMLElement | null;
    const focusables = () =>
      Array.from(nav?.querySelectorAll<HTMLElement>('a[href], button:not([disabled])') ?? []);

    focusables()[0]?.focus();

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') { setDrawerOpen(false); opener?.focus(); return; }
      if (e.key !== 'Tab') return;
      const items = focusables();
      if (!items.length) return;
      const first = items[0], last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
    };
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('keydown', onKey);
      opener?.focus();
    };
  }, [drawerOpen]);

  return (
    <div className="dc-shell">
      <a className="dc-skip" href="#main">Skip to content</a>

      <header className="dc-topbar">
        <Link
          to="/"
          style={{ textDecoration: 'none', display: 'flex', alignItems: 'center' }}
        >
          <Logo />
          {/* The lockup is artwork, so the link still needs a name for anyone not seeing it. */}
          <span className="dc-sr-only">Envision Design, home</span>
        </Link>

        <button
          type="button"
          className="dc-menu-button"
          aria-expanded={drawerOpen}
          aria-controls="dc-nav"
          onClick={() => setDrawerOpen((v) => !v)}
          style={{
            display: 'none',
            marginInlineStart: 'auto',
            background: 'none',
            border: '1px solid var(--envision-t2-color-border-default-default)',
            borderRadius: 'var(--envision-t2-border-radius-control)',
            padding: 'var(--dc-space-2) var(--dc-space-3)',
            font: 'inherit',
            cursor: 'pointer',
          }}
        >
          Menu
        </button>

        <nav className="dc-topbar-links" aria-label="Areas">
          {AREAS.map((a) => {
            const current = a.title === area.title;
            return (
              <Link
                key={a.title}
                to={a.path}
                aria-current={current ? 'page' : undefined}
                style={{
                  // The Tab component's own padding, unchanged. The bar is sized to it: 16 + label
                  // + 16 + the 2px indicator comes to exactly the bar height, which is what puts the
                  // indicator on the bar's bottom edge instead of floating above it.
                  padding: 'var(--envision-t2-spacing-container-padding-note) 0',
                  textDecoration: 'none',
                  whiteSpace: 'nowrap',
                  fontSize: 'var(--envision-t1-font-size-14)',
                  fontWeight: current
                    ? 'var(--envision-t1-font-weight-600)'
                    : 'var(--envision-t1-font-weight-500)',
                  color: current
                    ? 'var(--envision-t2-color-content-primary-default)'
                    : 'var(--envision-t2-color-content-secondary-default)',
                  borderBlockEnd: `2px solid ${
                    current ? 'var(--envision-t3-tab-selected-color-indicator-default)' : 'transparent'
                  }`,
                }}
              >
                {a.title}
              </Link>
            );
          })}
          <Search />
        </nav>
      </header>

      {/* id must match the menu button's aria-controls, which previously pointed at nothing. */}
      <nav id="dc-nav" ref={navRef} className="dc-nav" data-open={drawerOpen} aria-label="Documentation">
        <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
          {area.sections.map((s) => (
            <SectionItem key={s.path} section={s} pathname={pathname} />
          ))}
        </ul>

        <hr
          style={{
            margin: 'var(--dc-space-6) var(--dc-space-5) var(--dc-space-4)',
            border: 0,
            borderTop: '1px solid var(--envision-t2-color-border-default-default)',
          }}
        />
        <p
          style={{
            padding: '0 20px', margin: '0 0 var(--dc-space-3)', fontSize: 'var(--envision-t1-font-size-11)', letterSpacing: '0.08em',
            textTransform: 'uppercase', fontWeight: 'var(--envision-t1-font-weight-600)',
            color: 'var(--envision-t2-color-content-secondary-default)',
          }}
        >
          Tools &amp; Resources
        </p>
        <ul style={{ listStyle: 'none', margin: 0, padding: '0 20px', display: 'grid', gap: 'var(--dc-space-2)' }}>
          {TOOLS.map((t) => {
            const inner = (
              <>
                <span>{t.title}</span>
                <ExternalIcon />
              </>
            );
            const style: React.CSSProperties = {
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: 'var(--dc-space-2) var(--dc-space-3)', textDecoration: 'none',
              fontSize: 'var(--envision-t1-font-size-14)',
              color: 'var(--envision-t2-color-content-primary-default)',
              background: 'var(--dc-surface-sunken)',
              borderRadius: 'var(--envision-t2-border-radius-control)',
            };
            return (
              <li key={t.title}>
                {t.internal
                  ? <NavLink to={t.href} style={style}>{inner}</NavLink>
                  : <a href={t.href} target="_blank" rel="noreferrer" style={style}>{inner}</a>}
              </li>
            );
          })}
        </ul>
      </nav>

      {drawerOpen && (
        <div
          onClick={() => setDrawerOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgb(0 0 0 / 32%)', zIndex: 25 }}
          aria-hidden="true"
        />
      )}

      <div className="dc-main">
        <main id="main" tabIndex={-1} style={{ outline: 'none' }}>
          {children}
        </main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .dc-menu-button { display: inline-block !important; }
        }
      `}</style>
    </div>
  );
}

/** Shared by the two forms a section row can take: a link to its landing, or a disclosure. */
const sectionRowStyle = (active: boolean): CSSProperties => ({
  flex: 1,
  minWidth: 0,
  padding: 'var(--dc-space-2) 20px var(--dc-space-2) 0',
  fontSize: 'var(--envision-t1-font-size-14)',
  fontWeight: active ? 'var(--envision-t1-font-weight-600)' : 'var(--envision-t1-font-weight-500)',
  color: 'var(--envision-t2-color-content-primary-default)',
});

function SectionItem({ section, pathname }: { section: NavSection; pathname: string }) {
  // A section is active when the current route is inside it.
  const active =
    section.path === '/' ? pathname === '/' : pathname === section.path || pathname.startsWith(section.path + '/');
  const hasChildren = sectionPages(section).length > 0;

  // Expansion defaults to the route: the section you are inside opens itself. The chevron is a real
  // toggle on top of that default, so an open section can be collapsed and a section you are not in
  // can be opened for a look without navigating away from the page you are reading. The override is
  // dropped on navigation so the route is always what decides the resting state of the tree.
  const [override, setOverride] = useState<boolean | null>(null);
  useEffect(() => { setOverride(null); }, [pathname]);
  const expanded = hasChildren && (override ?? active);

  const [filter, setFilter] = useState('');
  // The filter is about the list, not the route, so it survives navigating between components and
  // clears when the section is closed.
  useEffect(() => { if (!expanded) setFilter(''); }, [expanded]);

  const groups = useMemo(() => {
    const q = filter.trim().toLowerCase();
    if (!q) return section.groups;
    const hit = (p: NavPage) =>
      p.title.toLowerCase().includes(q) ||
      (p.summary ?? '').toLowerCase().includes(q) ||
      (p.aliases ?? []).some((a) => a.toLowerCase().includes(q));
    return section.groups
      .map((g) => ({ ...g, items: g.items.filter(hit) }))
      .filter((g) => g.items.length > 0);
  }, [section.groups, filter]);

  const listId = `dc-nav-${section.path.replace(/[^a-z0-9]+/gi, '-')}`;

  return (
    <li>
      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          background: active ? 'var(--dc-surface-warm)' : 'transparent',
        }}
      >
        {active && (
          <span
            aria-hidden="true"
            style={{
              position: 'absolute',
              insetInlineStart: 0,
              insetBlock: 4,
              width: 3,
              borderRadius: 'var(--envision-t1-border-radius-2)',
              background: 'var(--envision-t2-color-background-brand-default)',
            }}
          />
        )}

        <Chevron
          expanded={expanded}
          present={hasChildren}
          controls={listId}
          label={section.title}
          onToggle={() => setOverride(!expanded)}
        />

        {section.landing === false ? (
          // No page of its own, so the row is purely a disclosure. Rendered as a button rather than
          // a dead link so it never looks like a destination the reader failed to reach.
          <button
            type="button"
            aria-expanded={expanded}
            aria-controls={hasChildren ? listId : undefined}
            onClick={() => setOverride(!expanded)}
            style={{ ...sectionRowStyle(active), textAlign: 'start', background: 'none', border: 0, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {section.title}
          </button>
        ) : (
          <NavLink
            to={section.path}
            // An open section closes when its row is clicked, the way its chevron does. Navigating to
            // a section you are already looking at achieved nothing, and left no way to collapse the
            // tree from the row itself. Collapsed, the row still navigates and opens.
            onClick={(e) => {
              if (expanded) {
                e.preventDefault();
                setOverride(false);
                return;
              }
              // Reopening needs to be explicit too: clicking the row of the section you are already
              // inside navigates to the same path, so the route never changes and the collapsed
              // override would otherwise survive the click.
              setOverride(true);
            }}
            style={{ ...sectionRowStyle(active), textDecoration: 'none' }}
          >
            {section.title}
          </NavLink>
        )}
      </div>

      {expanded && (
        <>
          {section.filterable && <SectionFilter value={filter} onChange={setFilter} label={section.title} />}
          <ul id={listId} style={{ listStyle: 'none', margin: 'var(--dc-space-1) 0 8px', padding: 0 }}>
            {groups.map((g, i) => (
              <li key={g.label ?? `g${i}`}>
                {/* A group heading names a shelf. With a filter running the shelves are mostly
                    empty, so the surviving matches read better as one list. */}
                {g.label && !filter && <GroupLabel>{g.label}</GroupLabel>}
                <ul style={{ listStyle: 'none', margin: 0, padding: 0 }}>
                  {g.items.map((c) => (
                    <li key={c.path}>
                      <NavLink to={c.path} end style={navChildStyle}>
                        <span>{c.title}</span>
                        {!c.built && <PendingDot />}
                      </NavLink>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
            {filter && groups.length === 0 && (
              <li style={{ ...navChildStyle({ isActive: false }), display: 'block' }} className="dc-small">
                No component matches “{filter}”.
              </li>
            )}
          </ul>
        </>
      )}
    </li>
  );
}

/**
 * The disclosure control for a top-level section, in place of the per-section pictogram.
 *
 * It is a button rather than part of the section link, because expanding a section and navigating
 * to it are two different intentions and an anchor may not contain a control. The box is 28x32 for
 * a real hit target, but the 16/8 margins put the glyph on the same optical center the pictogram
 * held, so labels still sit at the 52px indent `navChildStyle` aligns the child links to. A section
 * with no children keeps the box and hides the glyph, so every label stays on one baseline.
 * Rotation is covered by the global reduced-motion rule in app.css.
 */
function Chevron({
  expanded, present, controls, label, onToggle,
}: { expanded: boolean; present: boolean; controls: string; label: string; onToggle: () => void }) {
  const box: React.CSSProperties = {
    display: 'grid',
    placeItems: 'center',
    inlineSize: 28,
    blockSize: 32,
    marginInlineStart: 16,
    marginInlineEnd: 8,
    flex: '0 0 auto',
    color: 'var(--envision-t2-color-content-secondary-default)',
  };

  if (!present) return <span aria-hidden="true" style={box} />;

  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={expanded}
      aria-controls={expanded ? controls : undefined}
      aria-label={`${expanded ? 'Collapse' : 'Expand'} ${label}`}
      style={{ ...box, background: 'none', border: 0, padding: 0, font: 'inherit', cursor: 'pointer' }}
    >
      <svg
        width="16"
        height="16"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 140ms ease' }}
      >
        <path d="m9 6 6 6-6 6" />
      </svg>
    </button>
  );
}

const navChildStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  gap: 'var(--dc-space-2)',
  // 52 is derived, not chosen: the chevron slot is 16 + 28 + 8, so a child link starting at 52
  // lands exactly under its parent's label. It is off the spacing scale on purpose.
  padding: 'var(--dc-space-2) 20px var(--dc-space-2) 52px',
  textDecoration: 'none',
  fontSize: 'var(--envision-t1-font-size-14)',
  lineHeight: 1.4,
  fontWeight: isActive ? 'var(--envision-t1-font-weight-600)' : 'var(--envision-t1-font-weight-400)',
  color: isActive
    ? 'var(--envision-t2-color-content-brand-default)'
    : 'var(--envision-t2-color-content-secondary-default)',
});

/**
 * The heading over a run of pages inside a section, as Atlassian labels "Forms and input".
 *
 * It is deliberately not a link. A group names a shelf rather than a destination, and making it
 * navigable would put a page in the tree that only exists to hold other pages. It sits at the child
 * indent so the pages it introduces read as belonging to it.
 */
function GroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p
      style={{
        margin: 'var(--dc-space-3) 0 var(--dc-space-1)',
        padding: '0 20px 0 52px', // 52: the same derived child indent as navChildStyle
        fontSize: 'var(--envision-t1-font-size-11)',
        letterSpacing: '0.06em',
        textTransform: 'uppercase',
        fontWeight: 'var(--envision-t1-font-weight-600)',
        color: 'var(--envision-t2-color-content-secondary-default)',
      }}
    >
      {children}
    </p>
  );
}

/** Marks a route that is listed in the IA but not yet written. Honesty over apparent completeness. */
function PendingDot() {
  return (
    <span
      title="Not yet written"
      aria-label="Not yet written"
      style={{
        width: 5,
        height: 5,
        borderRadius: '50%',
        background: 'var(--envision-t1-color-neutral-200)',
        flex: '0 0 auto',
      }}
    />
  );
}

export function ExternalIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
      <path d="M15 3h6v6" />
      <path d="M10 14 21 3" />
    </svg>
  );
}

/**
 * Filter for a long section list, sitting inside the section it filters.
 *
 * Deliberately not search. The top bar searches the whole site and takes you somewhere; this
 * narrows the list already in front of you and leaves you where you are. It matches a component's
 * title, its purpose, and the aliases a reader might type instead of the name, so "dropdown" finds
 * the room selector and "a11y" finds the accessibility guidance.
 */
function SectionFilter({ value, onChange, label }: {
  value: string;
  onChange: (v: string) => void;
  label: string;
}) {
  return (
    <div style={{ padding: '0 20px 0 52px', margin: 'var(--dc-space-2) 0 var(--dc-space-1)' }}>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--dc-space-2)',
          padding: '0 var(--dc-space-3)',
          background: 'var(--dc-surface)',
          border: '1px solid var(--envision-t2-color-border-default-default)',
          borderRadius: 'var(--envision-t2-border-radius-control)',
        }}
      >
        <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16, color: 'var(--envision-t2-color-content-secondary-default)' }}>
          search
        </span>
        <input
          className="dc-nav-filter"
          type="search"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="Filter"
          aria-label={`Filter ${label}`}
          style={{
            flex: 1,
            minWidth: 0,
            border: 0,
            outline: 'none',
            background: 'transparent',
            font: 'inherit',
            fontSize: 'var(--envision-t1-font-size-13)',
            padding: 'var(--dc-space-2) 0',
            color: 'var(--envision-t2-color-content-primary-default)',
          }}
        />
        {value && (
          <button
            type="button"
            onClick={() => onChange('')}
            aria-label="Clear filter"
            style={{ display: 'grid', placeItems: 'center', border: 0, background: 'none', padding: 0, cursor: 'pointer', color: 'var(--envision-t2-color-content-secondary-default)' }}
          >
            <span className="material-symbols-outlined" aria-hidden="true" style={{ fontSize: 16 }}>close</span>
          </button>
        )}
      </div>
    </div>
  );
}
