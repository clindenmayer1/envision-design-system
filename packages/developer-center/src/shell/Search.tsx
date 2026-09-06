import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SEARCH_DOCS, type SearchDoc } from '../data/nav';

/**
 * Documentation search (Part XII).
 *
 * Not decorative: the index covers page titles, aliases, component names and categories, and every
 * generated token name, all built from the registry and token output rather than a hand-written
 * list. Results show title, content-type label, a context snippet and the breadcrumb, and the
 * whole control is keyboard operable (ArrowUp/Down, Enter, Escape) as required.
 */
export function Search() {
  const [q, setQ] = useState('');
  // Collapsed, search is an icon and a word. It only becomes a field once someone asks for one,
  // which keeps a 420px input out of a bar whose job is to show where you are.
  const [expanded, setExpanded] = useState(false);
  const [open, setOpen] = useState(false);
  const [cursor, setCursor] = useState(0);
  const boxRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  /** Set when the reader closed the field deliberately, so focus is handed back rather than lost. */
  const returnFocus = useRef(false);
  const navigate = useNavigate();

  const results = useMemo(() => (q.trim().length < 2 ? [] : rank(q, SEARCH_DOCS).slice(0, 8)), [q]);

  useEffect(() => setCursor(0), [q]);

  useEffect(() => {
    if (expanded) { inputRef.current?.focus(); return; }
    if (returnFocus.current) { returnFocus.current = false; triggerRef.current?.focus(); }
  }, [expanded]);

  // "/" focuses search from anywhere, the convention developers expect in documentation.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement;
      const typing = t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable;
      if (e.key === '/' && !typing) {
        e.preventDefault();
        setExpanded(true);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (boxRef.current?.contains(e.target as Node)) return;
      setOpen(false);
      // Collapse again only when nothing was typed, so a query is never thrown away by a stray click.
      if (!q) setExpanded(false);
    };
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, [q]);

  /**
   * Collapse back to the icon. `returnFocus` sends focus to the collapsed trigger: the expanded
   * field is unmounted on close, and focus would otherwise be dropped on the body, stranding a
   * keyboard user at the top of the document.
   */
  const close = () => {
    setQ('');
    setOpen(false);
    setExpanded(false);
    returnFocus.current = true;
  };

  const go = (r: SearchDoc) => {
    setOpen(false);
    setQ('');
    setExpanded(false);
    navigate(r.path);
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { close(); return; }
    if (!results.length) return;
    if (e.key === 'ArrowDown') { e.preventDefault(); setCursor((c) => (c + 1) % results.length); }
    else if (e.key === 'ArrowUp') { e.preventDefault(); setCursor((c) => (c - 1 + results.length) % results.length); }
    else if (e.key === 'Enter') { e.preventDefault(); go(results[cursor]); }
  };

  const listId = 'dc-search-results';

  if (!expanded) {
    return (
      <button
        type="button"
        ref={triggerRef}
        onClick={() => setExpanded(true)}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--dc-space-2)',
          padding: 0,
          background: 'none',
          border: 0,
          font: 'inherit',
          fontSize: 'var(--envision-t1-font-size-14)',
          fontWeight: 'var(--envision-t1-font-weight-500)',
          color: 'var(--envision-t2-color-content-primary-default)',
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: 'var(--envision-t1-font-size-20)', lineHeight: 1 }}
        >
          search
        </span>
        Search
      </button>
    );
  }

  return (
    <div ref={boxRef} style={{ position: 'relative', width: 360, maxWidth: '46vw' }}>
      <label htmlFor="dc-search" className="dc-sr-only">Search documentation</label>
      <span
        className="material-symbols-outlined"
        aria-hidden="true"
        style={{
          position: 'absolute', insetInlineStart: 14, top: '50%', transform: 'translateY(-50%)',
          fontSize: 'var(--envision-t1-font-size-20)', lineHeight: 1, color: 'var(--envision-t2-color-content-secondary-default)',
          pointerEvents: 'none',
        }}
      >
        search
      </span>
      <input
        id="dc-search"
        ref={inputRef}
        type="search"
        role="combobox"
        aria-expanded={open && results.length > 0}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={open && results.length ? `dc-r-${cursor}` : undefined}
        placeholder="Search the docs…"
        value={q}
        onChange={(e) => { setQ(e.target.value); setOpen(true); }}
        onFocus={() => setOpen(true)}
        onBlur={() => { if (!q) setExpanded(false); }}
        onKeyDown={onKeyDown}
        style={{
          width: '100%',
          height: 36,
          // The 42 is the inline padding, not the height: the magnifier sits at 14 and is 20 wide,
          // so text must clear 42. The height is set against the 56px bar, not against the icon.
          // 36 on the trailing side clears the close button, the same way 42 clears the magnifier.
          padding: '0 36px 0 42px',
          font: 'inherit',
          fontSize: 'var(--envision-t1-font-size-14)',
          color: 'var(--envision-t2-color-content-primary-default)',
          background: 'var(--dc-surface-warm)',
          border: '1px solid transparent',
          borderRadius: 'var(--envision-t1-border-radius-6)',
        }}
      />
      <button
        type="button"
        aria-label="Close search"
        // The pointer would otherwise blur the input before the click lands, and the blur handler
        // collapses an empty field — the button would appear to do nothing on an empty search.
        onMouseDown={(e) => e.preventDefault()}
        onClick={close}
        style={{
          position: 'absolute', insetInlineEnd: 6, top: '50%', transform: 'translateY(-50%)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          inlineSize: 26, blockSize: 26, padding: 0,
          background: 'none', border: 0, borderRadius: 'var(--envision-t2-border-radius-control-sm)',
          color: 'var(--envision-t2-color-content-secondary-default)', cursor: 'pointer',
        }}
      >
        <span
          className="material-symbols-outlined"
          aria-hidden="true"
          style={{ fontSize: 'var(--envision-t1-font-size-18)', lineHeight: 1 }}
        >
          close
        </span>
      </button>

      {open && q.trim().length >= 2 && (
        <div
          id={listId}
          role="listbox"
          aria-label="Search results"
          style={{
            position: 'absolute',
            insetInlineStart: 0,
            insetInlineEnd: 0,
            // Input height (36) plus the same 10px gap the panel has always had.
            top: 46,
            maxHeight: '60vh',
            overflowY: 'auto',
            background: 'var(--dc-surface)',
            border: '1px solid var(--envision-t2-color-border-default-default)',
            borderRadius: 'var(--envision-t2-border-radius-container-md)',
            boxShadow: '0 12px 32px rgb(0 0 0 / 12%)',
            zIndex: 40,
          }}
        >
          {results.length === 0 && (
            <p className="dc-small" style={{ padding: 'var(--dc-space-4)', margin: 0 }}>
              No matches for “{q}”. Try a component name, a token name, or a topic such as focus or contrast.
            </p>
          )}
          {results.map((r, i) => (
            <button
              key={r.path + r.title}
              id={`dc-r-${i}`}
              role="option"
              aria-selected={i === cursor}
              type="button"
              onMouseEnter={() => setCursor(i)}
              onClick={() => go(r)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: 'var(--dc-space-3) var(--dc-space-4)',
                border: 0,
                borderBlockEnd: '1px solid var(--envision-t2-color-border-default-default)',
                background: i === cursor ? 'var(--dc-surface-warm)' : 'transparent',
                font: 'inherit',
                cursor: 'pointer',
              }}
            >
              <span style={{ display: 'flex', alignItems: 'baseline', gap: 'var(--dc-space-2)', flexWrap: 'wrap' }}>
                <strong style={{ fontSize: 'var(--envision-t1-font-size-14)' }}>{r.title}</strong>
                <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>{r.kind}</span>
                {!r.built && (
                  <span className="dc-small" style={{ fontSize: 'var(--envision-t1-font-size-12)' }}>
                    · not yet written
                  </span>
                )}
              </span>
              {r.context && (
                <span className="dc-small" style={{ display: 'block', marginTop: 'var(--dc-space-1)' }}>
                  {truncate(r.context, 96)}
                </span>
              )}
              <span
                className="dc-small"
                style={{ display: 'block', marginTop: 'var(--dc-space-1)', fontSize: 'var(--envision-t1-font-size-12)', opacity: 0.75 }}
              >
                {r.breadcrumb}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

const truncate = (s: string, n: number) => (s.length <= n ? s : s.slice(0, n - 1).trimEnd() + '…');

/** Exact prefix beats word-start beats substring, so typing "but" surfaces Button before tokens. */
function rank(query: string, docs: SearchDoc[]): SearchDoc[] {
  const q = query.trim().toLowerCase();
  const scored: Array<{ d: SearchDoc; s: number }> = [];
  for (const d of docs) {
    const title = d.title.toLowerCase();
    const terms = d.terms.toLowerCase();
    let s = -1;
    if (title === q) s = 0;
    else if (title.startsWith(q)) s = 1;
    else if (new RegExp(`\\b${escapeRe(q)}`).test(title)) s = 2;
    else if (title.includes(q)) s = 3;
    else if (terms.includes(q)) s = 4;
    if (s >= 0) scored.push({ d, s: s + (d.built ? 0 : 0.5) });
  }
  return scored.sort((a, b) => a.s - b.s || a.d.title.length - b.d.title.length).map((x) => x.d);
}

const escapeRe = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
