import Link from "next/link";
import { ListingTags } from "./tags";
import { GAME_LABEL, formatPlayers } from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";

export function ServerCard({ listing, index = 0 }: { listing: Listing; index?: number }) {
  return (
    <article className="card reveal" style={{ "--i": index } as React.CSSProperties}>
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

        <div className="card__foot">
          <span className="card__players">
            {formatPlayers(listing.avgPlayers)}
            {listing.maxPlayers ? ` / ${formatPlayers(listing.maxPlayers)}` : ""}{" "}
            <small>avg players</small>
          </span>
          <span className="link-arrow" aria-hidden="true">
            View →
          </span>
        </div>
      </div>
    </article>
  );
}
