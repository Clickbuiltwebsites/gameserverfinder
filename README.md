# GameServerFinder

A server directory for **DayZ, FiveM, Minecraft and Rust**, built for
`gameserverfinder.com`. Server owners sign in with Google or an email link,
upload a picture, and publish a listing. Players filter by region, playstyle,
PvP, and — on FiveM only — whether the economy runs on drugs.

Next.js 16 (App Router) · TypeScript · Prisma 7 + PostgreSQL · Auth.js v5 ·
Vercel Blob.

---

## Run it now

```bash
npm install
npm run dev
```

Open <http://localhost:3000>. **No environment variables are needed to start.**
With `DATABASE_URL` unset the app runs in demo mode: nine sample listings served
from memory, plus a "continue as a demo user" button so you can exercise the
upload and publish flow immediately. Demo mode is disabled whenever
`NODE_ENV=production`, so it can never reach a deployment.

To run against a real database, copy `.env.example` to `.env.local`, fill it in,
then:

```bash
npm run db:push
npm run db:seed
```

---

## The listing fields

The brief asked for these, verbatim:

```html

* 
* Descriptions
* 
* How many players are on average
* 
* If it's a US server or UK-based server
* 
* If it's serious RP or if it's a shooter server
* 
* If it's PvP
* 
* If there are drugs in this server, like for FiveM, so that's specific to FiveM, etc.
* 


```

How each one is modelled — see [`src/lib/taxonomy.ts`](src/lib/taxonomy.ts) and
[`prisma/schema.prisma`](prisma/schema.prisma):

| Requirement | Field | Type |
| --- | --- | --- |
| Descriptions | `description` (long) + `tagline` (one line) | `String` |
| How many players are on average | `avgPlayers`, optional `maxPlayers` | `Int` |
| US or UK server | `region` | `enum Region { US · UK · EU · OTHER }` |
| Serious RP or shooter | `playstyle` | `enum Playstyle { SERIOUS_RP · SEMI_SERIOUS_RP · SHOOTER · SURVIVAL · CASUAL }` |
| If it's PvP | `pvp` | `Boolean` |
| Drugs — FiveM-specific | `drugs` | `Boolean?` — `null` on every non-FiveM game |
| (plus) server picture | `imageUrl` + `imageAlt` | `String?` |

`US` and `UK` are the two the brief names; `EU` and `OTHER` exist so the data
isn't forced to misreport a server hosted elsewhere. Same reasoning for the
three extra playstyles — a Rust wipe server is neither serious RP nor a shooter.

**The drugs field is genuinely FiveM-specific**, in three places:

1. The submit form only renders the control when FiveM is the selected game.
2. The browse filter only shows the "Drug economy" facet once FiveM is selected.
3. `listingSchema` strips the value server-side for any other game, so a
   hand-crafted POST can't set it either.

---

## Project structure

```
gameserverfinder/
├── prisma/
│   ├── schema.prisma          # User/Account/Session/VerificationToken + Listing
│   └── seed.ts                # writes the sample listings into Postgres
├── prisma.config.ts           # Prisma 7 config (datasource URL lives here now)
├── tokens.css                 # portable design tokens — colour, type, space, motion
├── scripts/
│   └── generate-og.mts        # renders the OG card to public/og.png
├── public/
│   ├── covers/*.svg           # hand-built cover art, one per game
│   └── og.png                 # generated Open Graph card
└── src/
    ├── auth.ts                # Auth.js v5: Google + email magic link
    ├── assets/fonts/          # TTFs used by the OG image renderer
    ├── app/
    │   ├── layout.tsx         # fonts, metadata, nav + footer shell
    │   ├── globals.css        # the whole design layer, token-locked
    │   ├── page.tsx           # home — discovery rails
    │   ├── actions.ts         # server actions: sign in/out, create, delete
    │   ├── opengraph-image.tsx        # site-wide OG card
    │   ├── robots.ts · sitemap.ts
    │   ├── servers/
    │   │   ├── page.tsx               # browse + filters
    │   │   └── [slug]/
    │   │       ├── page.tsx           # listing detail
    │   │       └── opengraph-image.tsx# per-listing OG card
    │   ├── submit/page.tsx    # the listing form (auth-gated)
    │   ├── dashboard/page.tsx # a user's own listings
    │   ├── signin/            # sign-in + "check your email"
    │   └── api/
    │       ├── auth/[...nextauth]/route.ts
    │       ├── upload/route.ts        # image upload
    │       └── search/route.ts        # feeds the ⌘K palette
    ├── components/            # nav, palette, cards, filters, form, uploader
    └── lib/
        ├── taxonomy.ts        # games, regions, playstyles, labels
        ├── types.ts · validation.ts (zod) · query.ts (URL filters)
        ├── prisma.ts · repo.ts        # data access + demo fallback
        ├── session.ts · site.ts · og.tsx
```

**Frontend** is React Server Components by default; only a handful of components
are client-side (the palette, uploader, form, copy button). **Backend** is
server actions for mutations plus three route handlers. **Database** is
PostgreSQL through Prisma 7's `pg` driver adapter.

---

## Authentication

Two ways in, both from the brief. Each provider registers only when its
credentials are present, so a fresh clone boots without secrets.

```ts
// src/auth.ts
import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Nodemailer from "next-auth/providers/nodemailer";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { getPrisma, hasDatabase } from "@/lib/prisma";

export const googleConfigured = Boolean(
  process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
);
export const emailConfigured = Boolean(
  process.env.EMAIL_SERVER && process.env.EMAIL_FROM && hasDatabase
);

const providers = [];
if (googleConfigured) {
  providers.push(Google({
    clientId: process.env.AUTH_GOOGLE_ID,
    clientSecret: process.env.AUTH_GOOGLE_SECRET,
  }));
}
if (emailConfigured) {
  providers.push(Nodemailer({
    server: process.env.EMAIL_SERVER,
    from: process.env.EMAIL_FROM,
    maxAge: 15 * 60,          // link expires in 15 minutes
  }));
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  adapter: hasDatabase ? PrismaAdapter(getPrisma()) : undefined,
  providers,
  session: { strategy: "jwt" },
  pages: { signIn: "/signin", verifyRequest: "/signin/check-email" },
  callbacks: {
    jwt({ token, user }) { if (user?.id) token.uid = user.id; return token; },
    session({ session, token }) {
      if (session.user && typeof token.uid === "string") session.user.id = token.uid;
      return session;
    },
  },
  trustHost: true,
});
```

Sign-in is invoked from a server action, so the buttons work without client JS:

```tsx
// src/app/actions.ts
"use server";
export async function signInWithGoogle() {
  await signIn("google", { redirectTo: "/dashboard" });
}
export async function signInWithEmail(formData: FormData) {
  const email = formData.get("email");
  if (typeof email !== "string" || !email.includes("@")) redirect("/signin?error=email");
  await signIn("nodemailer", { email, redirectTo: "/dashboard" });
}
```

**Setting up Google.** Cloud Console → APIs & Services → Credentials → Create
OAuth client ID → Web application. Authorised redirect URIs:

```
http://localhost:3000/api/auth/callback/google
https://gameserverfinder.com/api/auth/callback/google
```

**Setting up email links.** Any SMTP provider works. `EMAIL_SERVER` is a
connection string, `EMAIL_FROM` the sender. This provider needs the database —
one-time tokens live in the `VerificationToken` table.

---

## Image upload

`POST /api/upload` takes a single file. It requires a session, caps at 4 MB, and
verifies the file's **magic bytes** rather than trusting the declared MIME type:

```ts
// src/app/api/upload/route.ts  (abridged)
export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) return fail("Sign in before uploading a picture.", 401);

  const file = form.get("file");
  if (file.size > MAX_BYTES) return fail("Server pictures are capped at 4 MB…", 413);

  const bytes = new Uint8Array(await file.arrayBuffer());
  const sniffed = sniff(bytes);                       // PNG / JPEG / WebP signatures
  if (!sniffed) return fail("Upload a PNG, JPEG, or WebP image.", 415);

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const key = `listings/${user.id}/${crypto.randomUUID()}.${extension}`;
    const blob = await put(key, Buffer.from(bytes), {
      access: "public", contentType: sniffed, addRandomSuffix: false,
    });
    return Response.json({ url: blob.url });
  }
  // Local dev with no blob store: hand back a data: URL so the flow still works.
}
```

The client uploads with `XMLHttpRequest` (not `fetch`) purely to get a real
progress event, and drops the resulting URL into a hidden field:

```tsx
// src/components/image-upload.tsx  (abridged)
const request = new XMLHttpRequest();
request.open("POST", "/api/upload");
request.upload.addEventListener("progress", (event) => {
  if (event.lengthComputable) setProgress(Math.round((event.loaded / event.total) * 100));
});
request.addEventListener("load", () => {
  const data = JSON.parse(request.responseText);
  if (data.url) { setUrl(data.url); setStatus("done"); }
  else { setStatus("error"); setMessage(data.error); }
});
request.send(form);
```

> **4.5 MB body limit.** Uploads route through the server, so they inherit
> Vercel's request body cap — hence the 4 MB ceiling. If you need larger files,
> switch to Vercel Blob **client uploads** (`handleUpload` from
> `@vercel/blob/client`), which sends the browser straight to blob storage with a
> short-lived token.

---

## The listing form

The form posts to a server action. Because server actions are reachable by
direct POST, authorisation and validation both live on the server:

```ts
// src/app/actions.ts
export async function createListingAction(_prev, formData: FormData) {
  const user = await getCurrentUser();
  if (!user) return { errors: { form: "Your session expired. Sign in again and resubmit." } };

  const parsed = listingSchema.safeParse(formDataToListing(formData));
  if (!parsed.success) return { errors: fieldErrors(parsed.error), values: … };

  const listing = await createListing(parsed.data, { id: user.id, name: user.name });
  revalidatePath("/"); revalidatePath("/servers");
  redirect(`/servers/${listing.slug}`);
}
```

The FiveM rule is enforced in the schema's transform, not the component:

```ts
// src/lib/validation.ts
.transform((value): ListingInput => ({
  ...value,
  drugs: drugsApplies(value.game) ? Boolean(value.drugs) : null,
}));
```

And the game picker drives which controls exist at all:

```tsx
// src/components/listing-form.tsx
const [game, setGame] = useState<Game>("FIVEM");
const showDrugs = drugsApplies(game);
…
{showDrugs ? (
  <label className="switch">
    <input type="checkbox" name="drugs" />
    <span className="switch__title">There is a drug economy</span>
  </label>
) : null}
```

**Filters are links, not client state.** Every filter combination is a real,
shareable, indexable URL that works with JavaScript disabled — see
[`src/lib/query.ts`](src/lib/query.ts) and
[`src/components/filters.tsx`](src/components/filters.tsx).

---

## Open Graph image

Generated fresh — nothing borrowed. Three artefacts:

| Artefact | Where | When it renders |
| --- | --- | --- |
| Site-wide card | `src/app/opengraph-image.tsx` | once at `next build` |
| Per-listing card | `src/app/servers/[slug]/opengraph-image.tsx` | on demand per server |
| Static file | `public/og.png` via `npm run og` | whenever you run it |

**Specification**

- **Dimensions** 1200 × 630 px (1.91:1) — the Facebook / X / LinkedIn / Discord
  standard. Renders at 1× PNG, ~70 KB.
- **Safe area** 72 px padding on all sides; nothing meaningful within it.
- **Background** `#14100d` (the Midnight paper token) with a warm amber glow
  rising from the bottom edge, plus a 10 px accent rail down the left.
- **Typography** Bricolage Grotesque ExtraBold for the headline (86 px, −3.6
  tracking, 1.02 leading); Geist Regular/SemiBold for supporting copy. The TTFs
  are committed under `src/assets/fonts/` so the render is deterministic and
  offline-safe.
- **Content, site-wide card**
  1. Wordmark with the rotated accent diamond, top-left
  2. Headline — "Four games. Filters that mean something."
  3. Sub-line naming the facets, including the FiveM drug economy
  4. Four game pills (DayZ · FiveM · Minecraft · Rust), bottom-left
  5. `gameserverfinder.com` in accent amber, bottom-right
- **Content, per-listing card** — wordmark + game, top; server name (size steps
  down at 16 and 26 characters so long names never collide with the tagline);
  tagline; then region / playstyle / PvP / drug-economy pills and the average
  player count.
- **Contrast** every text pair clears WCAG AA against its background.

Regenerate the static file after any design change:

```bash
npm run og
```

> Satori (which backs `next/og`) supports flexbox and a subset of CSS — **no CSS
> grid and no `oklch()`**. That is why `src/lib/og.tsx` carries hex equivalents
> of the Midnight tokens rather than referencing the custom properties directly.

---

## Design system

`tokens.css` holds every colour, type size, space step, radius, duration and
easing. `globals.css` references them by name and never inlines a raw value, so
the system stays portable — drop `tokens.css` into another project and the
vocabulary comes with it.

- **Palette** Midnight: `oklch(15% 0.012 55)` paper, warm amber accent at
  `oklch(76% 0.163 62)`, neutrals tinted toward the same anchor hue.
- **Type** Bricolage Grotesque (display) + Geist (body) + Geist Mono (player
  counts, tags, connect strings). Three families, which is the ceiling.
- **Contrast** verified in-browser. Body text runs 8.5:1 to 17.5:1;
  `--color-rule-2` is tuned so interactive borders clear WCAG 1.4.11's 3:1 on
  every surface they appear on — don't darken it without re-checking.
- **Motion** three primitives total: a one-shot staggered entrance, a 2 px card
  hover lift, and the palette's highlight transition. All collapse under
  `prefers-reduced-motion`.
- **Responsive** verified at 320 / 375 / 414 / 768 px: no horizontal scroll, no
  clickable label wrapping to two lines, 44 px touch targets.

---

## Push to GitHub

The repository is initialised with an initial commit already. To publish it:

```bash
gh repo create gameserverfinder --public --source=. --remote=origin --push
```

Without the `gh` CLI, create an empty repo on github.com first, then:

```bash
git remote add origin https://github.com/<your-username>/gameserverfinder.git
git branch -M main
git push -u origin main
```

Starting from scratch instead:

```bash
git init
git add .
git commit -m "Initial commit: GameServerFinder"
git branch -M main
git remote add origin https://github.com/<your-username>/gameserverfinder.git
git push -u origin main
```

`.gitignore` excludes `node_modules`, `.next`, `.vercel`, and every `.env*`
file **except** `.env.example`. No secrets are committed.

---

## Vercel deployment checklist

Not deployed yet — this is the runbook for when you are ready.

**1 · Provision a database**

- [ ] Vercel dashboard → Storage → create a Postgres database (Neon and Supabase
      work identically), connect it to the project
- [ ] Confirm `DATABASE_URL` was injected into the project's environment

**2 · Provision blob storage**

- [ ] Storage → Blob → connect to project. Vercel injects
      `BLOB_READ_WRITE_TOKEN` automatically
- [ ] Without it, uploads return HTTP 501 with a clear message rather than
      failing silently

**3 · Environment variables** (Settings → Environment Variables, all three
environments unless noted)

| Variable | Required | Notes |
| --- | --- | --- |
| `DATABASE_URL` | yes | injected by Vercel Postgres |
| `AUTH_SECRET` | yes | `npx auth secret` — a different value per environment |
| `AUTH_GOOGLE_ID` | for Google | OAuth client ID |
| `AUTH_GOOGLE_SECRET` | for Google | OAuth client secret |
| `EMAIL_SERVER` | for email links | SMTP connection string |
| `EMAIL_FROM` | for email links | e.g. `GameServerFinder <no-reply@gameserverfinder.com>` |
| `BLOB_READ_WRITE_TOKEN` | for uploads | injected by Vercel Blob |
| `NEXT_PUBLIC_SITE_URL` | no | only if not on Vercel; otherwise inferred |

**4 · Build settings** — the defaults are correct; verify rather than change:

- [ ] Framework preset: **Next.js**
- [ ] Build command: `npm run build` (runs `prisma generate && next build`)
- [ ] Install command: `npm install` (`postinstall` also runs `prisma generate`)
- [ ] Output directory: leave blank — Next.js manages it
- [ ] Node version: 20.x or newer

**5 · First deploy**

- [ ] Import the GitHub repo in Vercel and deploy
- [ ] Push the schema once the database is reachable:
      `npx prisma migrate deploy` (or `npm run db:push` for a fast first pass)
- [ ] Optionally seed sample data: `npm run db:seed`

**6 · Domain**

- [ ] Add `gameserverfinder.com` and `www.gameserverfinder.com` in Settings →
      Domains, follow the DNS instructions
- [ ] Add the production callback URL to the Google OAuth client:
      `https://gameserverfinder.com/api/auth/callback/google`
- [ ] If Deployment Protection is on, disable it for production or search
      engines and social scrapers will not see the site

**7 · Verify after deploy**

- [ ] `/` renders listings from Postgres, not the demo set — the footer must
      **not** say "demo data, no database connected"
- [ ] Google sign-in completes and lands on `/dashboard`
- [ ] An email link arrives and signs you in
- [ ] Publishing a listing with a picture returns a
      `*.public.blob.vercel-storage.com` URL
- [ ] `/opengraph-image` returns a 1200 × 630 PNG; paste a listing URL into
      Discord or the Facebook debugger to confirm the card
- [ ] `/robots.txt` and `/sitemap.xml` resolve and reference the real domain

---

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | dev server (demo mode if `DATABASE_URL` is unset) |
| `npm run build` | `prisma generate` then `next build` |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run lint` | ESLint |
| `npm run db:push` | push the schema without a migration file |
| `npm run db:migrate` | create and apply a migration |
| `npm run db:deploy` | apply migrations in production |
| `npm run db:seed` | write the sample listings |
| `npm run db:studio` | Prisma Studio |
| `npm run og` | regenerate `public/og.png` |

---

## Notes and known limits

- **Editing a listing** is not built yet — owners can publish and delete. The
  server action and ownership check for delete
  ([`deleteListing`](src/lib/repo.ts)) are the pattern to copy for an update.
- **No moderation queue.** Every listing publishes immediately. The
  `ListingStatus` enum already has `DRAFT` and `HIDDEN` if you want review.
- **Player counts are self-reported**, and the UI says so. Live querying would
  mean per-game protocols (A2S for Rust/DayZ, the FiveM info endpoint, Minecraft
  server list ping) on a cron.
- **Demo mode listings are in memory** and reset when the dev server restarts.
