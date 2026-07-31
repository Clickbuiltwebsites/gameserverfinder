import {
  PLAYSTYLE_LABEL,
  REGION_LABEL,
  REGION_LONG,
  drugsApplies,
} from "@/lib/taxonomy";
import type { Listing } from "@/lib/types";

/**
 * Two registers, not one. Region and playstyle are context a reader skims, so
 * they sit as quiet monospace metadata. PvP and the FiveM drug economy are the
 * things someone actually filters on, so they keep a chip — each pairing colour
 * with a glyph and a word, so nothing depends on colour alone.
 */
export function ListingTags({ listing, size }: { listing: Listing; size?: "lg" }) {
  const cls = size === "lg" ? "tag tag--lg" : "tag";
  const metaCls = size === "lg" ? "tag-meta tag-meta--lg" : "tag-meta";
  const showDrugs = drugsApplies(listing.game) && listing.drugs !== null;

  return (
    <ul className="tags">
      <li>
        <span className={metaCls}>
          <span title={REGION_LONG[listing.region]}>{REGION_LABEL[listing.region]}</span>
          <span className="tag-meta__sep" aria-hidden="true">
            /
          </span>
          <span>{PLAYSTYLE_LABEL[listing.playstyle]}</span>
        </span>
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
      {showDrugs ? (
        <li>
          {listing.drugs ? (
            <span className={`${cls} tag--drugs`}>
              <span aria-hidden="true">◈</span> Drugs
            </span>
          ) : (
            <span className={cls}>No drugs</span>
          )}
        </li>
      ) : null}
    </ul>
  );
}
