import {
  PLAYSTYLE_LABEL,
  REGION_LABEL,
  REGION_LONG,
  drugsApplies,
} from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";

/**
 * The tag row every listing carries. Signal tags (PvP, drugs) pair colour with a
 * glyph and a word, so nothing depends on colour alone.
 */
export function ListingTags({ listing, size }: { listing: Listing; size?: "lg" }) {
  const cls = size === "lg" ? "tag tag--lg" : "tag";

  return (
    <ul className="tags">
      <li>
        <span className={`${cls} tag--region`} title={REGION_LONG[listing.region]}>
          {REGION_LABEL[listing.region]}
        </span>
      </li>
      <li>
        <span className={cls}>{PLAYSTYLE_LABEL[listing.playstyle]}</span>
      </li>
      <li>
        {listing.pvp ? (
          <span className={`${cls} tag--pvp`}>
            <span aria-hidden="true">⚔</span> PvP
          </span>
        ) : (
          <span className={`${cls} tag--pve`}>
            <span aria-hidden="true">✦</span> PvE
          </span>
        )}
      </li>
      {drugsApplies(listing.game) && listing.drugs !== null ? (
        <li>
          {listing.drugs ? (
            <span className={`${cls} tag--drugs`}>
              <span aria-hidden="true">◈</span> Drug economy
            </span>
          ) : (
            <span className={cls}>No drug economy</span>
          )}
        </li>
      ) : null}
    </ul>
  );
}
