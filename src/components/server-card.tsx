import Link from "next/link";
import { ListingTags } from "./tags";
import { GAME_LABEL, formatPlayers } from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";

/** `index` now only decides image loading priority — it no longer staggers. */
export function ServerCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  return (
    // Cards no longer animate individually. Staggering every tile meant a browse
    // page of eighteen took 730ms to settle, and the index cap collapsed
    // everything past the sixth into one identical delay — a slab, not a stagger.
    // The page entrance now runs once, on the sections.
    <article className="card">
      <div className="card__media">
        {listing.imageUrl ? (
          /* Covers come from user uploads on arbitrary hosts, so this stays a
             plain <img> rather than next/image with a remote-pattern allowlist. */
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={listing.imageUrl}
            alt={listing.imageAlt ?? `${listing.name} cover image`}
            loading={index < 3 ? "eager" : "lazy"}
            decoding="async"
          />
        ) : (
          <div className="card__fallback" aria-hidden="true">
            <span>No picture yet</span>
          </div>
        )}
        <span className="card__game">{GAME_LABEL[listing.game]}</span>
      </div>

      <div className="card__body">
        <h3 className="card__name">
          <Link className="card__link" href={`/servers/${listing.slug}`}>
            {listing.name}
          </Link>
        </h3>
        <p className="card__tagline">{listing.tagline}</p>

        <ListingTags listing={listing} />

        {/* The whole card is the link, so a decorative "View →" was a second
            affordance that did nothing. The population number owns the footer. */}
        <div className="card__foot">
          <span className="card__players">
            {formatPlayers(listing.avgPlayers)}
            {listing.maxPlayers ? (
              <span className="card__players-max">/{formatPlayers(listing.maxPlayers)}</span>
            ) : null}
          </span>
          <small className="card__players-label">avg players</small>
        </div>
      </div>
    </article>
  );
}
