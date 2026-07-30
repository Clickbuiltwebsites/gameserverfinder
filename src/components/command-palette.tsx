"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Result = { slug: string; name: string; meta: string };

const SHORTCUTS: Result[] = [
  { slug: "", name: "Browse every server", meta: "/servers" },
  { slug: "", name: "List a server", meta: "/submit" },
];

const QUICK_FILTERS = [
  { label: "FiveM · serious RP", href: "/servers?game=FIVEM&playstyle=SERIOUS_RP" },
  { label: "UK servers", href: "/servers?region=UK" },
  { label: "US servers", href: "/servers?region=US" },
  { label: "PvP only", href: "/servers?pvp=yes" },
];

export function CommandPalette() {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Result[]>([]);
  const [selected, setSelected] = useState(0);
  const [searching, setSearching] = useState(false);
  const router = useRouter();
  const listId = useId();

  const open = useCallback(() => {
    const dialog = dialogRef.current;
    if (!dialog || dialog.open) return;
    dialog.showModal();
    // Focus without animation — keyboard users reached this deliberately.
    requestAnimationFrame(() => inputRef.current?.focus());
  }, []);

  const close = useCallback(() => {
    dialogRef.current?.close();
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key.toLowerCase() === "k" && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        if (dialogRef.current?.open) close();
        else open();
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, close]);

  // Search-as-you-type, debounced by 250ms so we don't fire per keystroke.
  // Nothing is set synchronously here: below two characters we simply don't
  // search, and `items` falls back to the shortcut list, so any stale results
  // left in state are never rendered.
  useEffect(() => {
    const term = query.trim();
    if (term.length < 2) return;

    const controller = new AbortController();
    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const response = await fetch(`/api/search?q=${encodeURIComponent(term)}`, {
          signal: controller.signal,
        });
        if (!response.ok) throw new Error(String(response.status));
        const data = (await response.json()) as { results: Result[] };
        setResults(data.results);
        setSelected(0);
      } catch (error) {
        if ((error as Error).name !== "AbortError") setResults([]);
      } finally {
        setSearching(false);
      }
    }, 250);

    return () => {
      controller.abort();
      clearTimeout(timer);
    };
  }, [query]);

  const items: Array<{ label: string; meta: string; href: string }> =
    query.trim().length >= 2
      ? results.map((r) => ({ label: r.name, meta: r.meta, href: `/servers/${r.slug}` }))
      : [
          ...SHORTCUTS.map((s) => ({ label: s.name, meta: s.meta, href: s.meta })),
          ...QUICK_FILTERS.map((f) => ({ label: f.label, meta: "filter", href: f.href })),
        ];

  function go(href: string) {
    close();
    setQuery("");
    router.push(href);
  }

  function onInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setSelected((i) => (items.length ? (i + 1) % items.length : 0));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setSelected((i) => (items.length ? (i - 1 + items.length) % items.length : 0));
    } else if (event.key === "Enter") {
      event.preventDefault();
      const item = items[selected];
      if (item) go(item.href);
    }
  }

  return (
    <>
      <button type="button" className="nav__search" onClick={open}>
        <svg width="14" height="14" viewBox="0 0 16 16" fill="none" aria-hidden="true">
          <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
          <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
        <span className="nav__search-label">Search servers</span>
        <kbd className="kbd">⌘K</kbd>
      </button>

      <dialog
        ref={dialogRef}
        className="palette"
        aria-label="Search servers"
        onClose={() => setQuery("")}
        onClick={(event) => {
          if (event.target === dialogRef.current) close();
        }}
      >
        <div className="palette__field">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
            <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.5" />
            <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <input
            ref={inputRef}
            className="palette__input"
            type="search"
            placeholder="Search by name, or jump to a filter"
            value={query}
            aria-controls={listId}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onInputKeyDown}
          />
        </div>

        <ul className="palette__list" id={listId}>
          <li className="palette__group">
            {query.trim().length >= 2 ? "Servers" : "Go to"}
          </li>
          {items.length === 0 ? (
            <li className="palette__empty">
              {searching ? "Searching…" : `Nothing matches “${query.trim()}”.`}
            </li>
          ) : (
            items.map((item, index) => (
              <li key={`${item.href}-${item.label}`}>
                <button
                  type="button"
                  className="palette__item"
                  data-selected={index === selected}
                  onMouseEnter={() => setSelected(index)}
                  onClick={() => go(item.href)}
                >
                  <span>{item.label}</span>
                  <span className="palette__item-meta">{item.meta}</span>
                </button>
              </li>
            ))
          )}
        </ul>

        <p className="visually-hidden" aria-live="polite">
          {query.trim().length >= 2 && !searching
            ? `${items.length} ${items.length === 1 ? "server" : "servers"} found`
            : ""}
        </p>

        <div className="palette__foot">
          <span>↑ ↓ to move</span>
          <span>↵ to open</span>
          <span>esc to close</span>
        </div>
      </dialog>
    </>
  );
}
