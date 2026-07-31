# Design — GameServerFinder

The locked design system for this app. Every page reads this file before it
changes anything visual. Extend or amend it when the system needs to grow;
don't override it per page. Token values live in [`tokens.css`](tokens.css) —
this file explains *why*, so nobody undoes a decision by accident.

## Genre

**Atmospheric.** Dark canvas, one warm light source, a single warm accent, plain
technical copy. The audience is players hunting a server, usually at night. The
aesthetic answers to that, not to a B2B dashboard.

## Macrostructure

- **Discovery pages** (`/`) — Ecosystem Index: a positioning statement, then
  rails that each surface a different cut of the listings.
- **App pages** (`/servers`, `/submit`, `/dashboard`) — filter rail plus results,
  or a single-column form. No enrichment; function carries these.
- **Content pages** (`/servers/[slug]`) — capped banner, then a two-column split
  of prose and a spec ledger.

## The five decisions that make it modern

These are the load-bearing ones. Reverting any of them undoes the redesign.

1. **Surfaces climb by lightness; borders are for interactive edges only.**
   `paper` → `paper-2` → `paper-3` → `paper-4` is the elevation ladder. A
   hairline on every box is what made the page read as a grid of containers
   rather than a grid of servers. Bordered boxes on the home page went from 52
   to 11.

2. **A recess is darker than the plane above it.** `.card__media` and
   `.upload__preview` sit on `--color-paper`, below the card face. Lighting the
   hole brighter than its surround made a listing with no screenshot the loudest
   tile in the row.

3. **Two small sizes with different jobs.** `--text-ui` (13px) is control text —
   buttons, chips, nav, form labels. `--text-sm` (14px) is reading text —
   taglines, notes, prose. Putting prose back on 13px at weight 350 in muted
   grey is the 2019 dashboard idiom; body weight is 400, and only the large
   ledes drop to 350 where their size carries the lightness.

4. **Every vertical seam is owned by the block below it.** Never a bottom
   padding plus a top padding summed together. Section heads sit 40px from their
   content where the grid gap is 24px, so proximity actually groups.

5. **One light source, no decoration.** Two fixed radial blooms at ≤11% alpha
   and a 3.5% grain layer. That is the entire canvas treatment. No aurora mesh,
   no floating orbs, no glassmorphism, no gradient text.

## Theme — Midnight

| Token | Value | Role |
| --- | --- | --- |
| `--color-paper` | `oklch(15% 0.012 55)` | page, and the bottom of every recess |
| `--color-paper-2` | `oklch(21% 0.014 55)` | cards, inputs, raised surfaces |
| `--color-paper-3` | `oklch(26% 0.016 55)` | hover, chips, tag fills |
| `--color-paper-4` | `oklch(31% 0.016 55)` | highest surface |
| `--color-rule` | `oklch(31% 0.012 55)` | decorative hairlines, dividers |
| `--color-rule-2` | `oklch(54% 0.014 55)` | **interactive** borders — tuned for WCAG 1.4.11's 3:1 |
| `--color-neutral` | `oklch(67% 0.011 55)` | captions; read on paper-3 in card hover |
| `--color-muted` | `oklch(76% 0.009 55)` | secondary prose |
| `--color-ink` | `oklch(96% 0.006 55)` | primary text |
| `--color-accent` | `oklch(76% 0.163 62)` | warm amber, ≤3% of any viewport |
| `--color-accent-ink` | `oklch(17% 0.035 62)` | text on an accent fill |

Do not darken `--color-rule-2` or `--color-neutral` without re-running the
contrast check — both are tuned to clear their thresholds with modest headroom.

## Typography

- **Display** Bricolage Grotesque 700/800 — headings, the hero, player counts.
- **Body** Geist 350–600.
- **Mono** Geist Mono — every number, every uppercase caption, connect strings.

Three families is the ceiling. Tracking is tokenised: `--track-display`
(-0.042em) for the hero and rail titles, `--track-heading` (-0.03em) for the
rest, `--track-label` (0.09em) for uppercase captions. Headings are always
roman — no italic display, ever.

## Radii

Three plus a pill: `sm` 4px for controls, `md` 8px for containers, `lg` 14px for
the detail banner and palette, `pill` **only** for filter chips and the search
field, where it still reads current. Five competing radii in one viewport reads
as unresolved.

## Motion — three primitives, no more

1. **Page reveal** — one orchestrated entrance on the sections, staggered 70ms,
   settling in ~590ms. Never per card: eighteen staggered tiles took 730ms and
   arrived as a slab.
2. **Media scale on hover** — 1.02 on the card's picture. One signal per
   element, and it belongs to the thing the reader is deciding on.
3. **Palette highlight** — 110ms background transition on the selected row.

Everything collapses under `prefers-reduced-motion`. No bounce, no elastic, no
parallax, no scroll-linked animation, no cursor followers.

## Interaction contract

- Focus rings appear instantly, never animated, 2px at `--color-focus`.
- Cards use `:has(.card__link:focus-visible)`, not `:focus-within` — browsers
  focus a link on mouse-down, and `:focus-within` leaves the ring painted after
  an ordinary click.
- Selected states get a hover response. A selected filter chip is the primary
  "remove this filter" target; it must answer the pointer.
- State is never signalled by colour alone — PvP and drug-economy chips pair
  colour with a glyph and a word.
- Input borders are 1px in every state. Never transition `border-width`.
- Touch targets ≥ 44px; verified at 320 / 375 / 414 / 768px.

## Copy voice

Technical and specific. Name the thing. No "seamless", no "unleash", no
invented statistics — every number on the site is computed from the listings
table. Error messages say what broke, why, and what to do.

## Exports

`tokens.css` at the project root is the portable artefact. Copy it into another
project and the vocabulary comes with it: colour, type scale, spacing, radii,
easings, durations, z-index.
