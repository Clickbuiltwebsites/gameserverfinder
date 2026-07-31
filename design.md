# Design — GameServerFinder

The locked design system for this app. Every page reads this file before it
changes anything visual. Extend or amend it when the system needs to grow;
don't override it per page. Token values live in [`tokens.css`](tokens.css) —
this file explains *why*, so nobody undoes a decision by accident.

## Genre

**Atmospheric, black.** A black canvas carrying nothing, a single tempered amber
accent, plain technical copy. The audience is players hunting a server, usually
at night. The aesthetic answers to that, not to a B2B dashboard.

The canvas is bare on purpose. An earlier pass painted two warm radial blooms
and a grain layer over it; both were removed. A dark page with glow bleeding
from the corners is the most recognisable generated-landing-page signature there
is, and the glow was doing work that type, spacing and photography should do. On
black, the server pictures are the only light in the composition — which is the
right hierarchy for a directory. If depth is wanted, it belongs in the surface
ladder, never in a gradient painted over the page.

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

5. **The canvas is black and carries nothing.** No blooms, no grain, no
   gradients anywhere on any page — a check across `/`, `/servers`, the detail
   page and `/submit` returns zero gradient-painted elements. No aurora mesh, no
   floating orbs, no glassmorphism, no gradient text, no glowing accent.

## Theme — Midnight

| Token | Value | Renders | Role |
| --- | --- | --- | --- |
| `--color-paper` | `oklch(8% 0.002 60)` | `#020201` | the black page, and the floor of every recess |
| `--color-paper-2` | `oklch(21% 0.006 60)` | `#1a1816` | cards, inputs, raised surfaces |
| `--color-paper-3` | `oklch(26% 0.007 60)` | `#272321` | hover, chips, tag fills |
| `--color-paper-4` | `oklch(31% 0.008 60)` | `#332f2c` | highest surface |
| `--color-rule` | `oklch(29% 0.006 60)` | | decorative hairlines, dividers |
| `--color-rule-2` | `oklch(55% 0.009 60)` | `#706b67` | **interactive** borders — WCAG 1.4.11's 3:1 |
| `--color-neutral` | `oklch(66% 0.008 60)` | | captions; read on paper-3 in card hover |
| `--color-muted` | `oklch(76% 0.006 60)` | | secondary prose |
| `--color-ink` | `oklch(94% 0.004 60)` | `#edeae8` | primary text — not pure white |
| `--color-accent` | `oklch(74% 0.125 66)` | `#e09a4d` | tempered amber, ≤3% of any viewport |
| `--color-accent-ink` | `oklch(14% 0.028 66)` | | text on an accent fill |

Three numbers to re-check after any colour change, because each is tuned to
clear its threshold with modest headroom:

- **paper-2 against paper = 1.17.** This step is the only thing making a card
  visible on black. Below roughly 1.12 the cards dissolve into the page.
- **rule-2 against paper-3 = 3.19.** rule-2 is tuned against the *lightest*
  surface it ever appears on (the search pill's hover state), not the darkest.
- **Ink is 94%, not 100%.** Pure white on black smears at small sizes.

The accent's chroma came down from 0.163 to 0.125 when the canvas went black. A
saturated accent glowing against a black field is the single most template-like
thing a dark UI can do, and the brief ruled out colours that clash with black.
The hue is unchanged — the amber is the brand.

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
