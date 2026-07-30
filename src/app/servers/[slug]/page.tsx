import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { ListingTags } from "@/components/tags";
import { CopyButton } from "@/components/copy-button";
import { getListingBySlug } from "@/lib/repo";
import {
  GAME_LABEL,
  PLAYSTYLE_LABEL,
  REGION_LONG,
  drugsApplies,
  formatPlayers,
} from "@/lib/taxonomy";

type Props = { params: Promise<{ slug: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) return { title: "Server not found" };

  return {
    title: listing.name,
    description: listing.tagline,
    openGraph: {
      title: `${listing.name} — ${GAME_LABEL[listing.game]}`,
      description: listing.tagline,
      images: listing.imageUrl?.startsWith("http") ? [listing.imageUrl] : undefined,
    },
  };
}

export default async function ServerDetailPage({ params }: Props) {
  const { slug } = await params;
  const listing = await getListingBySlug(slug);
  if (!listing) notFound();

  const posted = new Date(listing.createdAt).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return (
    <article className="shell detail">
      <Link className="link-arrow" href={`/servers?game=${listing.game}`}>
        ← All {GAME_LABEL[listing.game]} servers
      </Link>

      <div style={{ marginBlockStart: "var(--space-lg)" }}>
        {listing.imageUrl ? (
          <figure className="detail__hero">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={listing.imageUrl}
              alt={listing.imageAlt ?? `${listing.name} cover image`}
              fetchPriority="high"
              decoding="async"
            />
          </figure>
        ) : null}

        <div className="detail__grid">
          <div>
            <h1 className="detail__title">{listing.name}</h1>
            <p className="detail__tagline">{listing.tagline}</p>

            <div style={{ marginBlockStart: "var(--space-md)" }}>
              <ListingTags listing={listing} size="lg" />
            </div>

            <div className="prose">{listing.description}</div>
          </div>

          <div className="aside">
            <dl className="spec">
              <div>
                <dt>Game</dt>
                <dd>{GAME_LABEL[listing.game]}</dd>
              </div>
              <div>
                <dt>Hosted in</dt>
                <dd>{REGION_LONG[listing.region]}</dd>
              </div>
              <div>
                <dt>Playstyle</dt>
                <dd>{PLAYSTYLE_LABEL[listing.playstyle]}</dd>
              </div>
              <div>
                <dt>Average players</dt>
                <dd>
                  {formatPlayers(listing.avgPlayers)}
                  {listing.maxPlayers ? ` / ${formatPlayers(listing.maxPlayers)}` : ""}
                </dd>
              </div>
              <div>
                <dt>PvP</dt>
                <dd>{listing.pvp ? "On" : "Off"}</dd>
              </div>
              {drugsApplies(listing.game) && listing.drugs !== null ? (
                <div>
                  <dt>Drug economy</dt>
                  <dd>{listing.drugs ? "Yes" : "No"}</dd>
                </div>
              ) : null}
              <div>
                <dt>Listed</dt>
                <dd>{posted}</dd>
              </div>
              {listing.ownerName ? (
                <div>
                  <dt>Listed by</dt>
                  <dd>{listing.ownerName}</dd>
                </div>
              ) : null}
            </dl>

            {listing.connectUrl ? (
              <div className="field">
                <span className="field__label">Connect</span>
                <div className="copy-row">
                  <code>{listing.connectUrl}</code>
                  <CopyButton value={listing.connectUrl} />
                </div>
              </div>
            ) : null}

            {listing.discordUrl ? (
              <a
                className="btn btn--primary btn--block"
                href={listing.discordUrl}
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                Open the Discord
              </a>
            ) : null}

            {listing.websiteUrl ? (
              <a
                className="btn btn--block"
                href={listing.websiteUrl}
                rel="nofollow noopener noreferrer"
                target="_blank"
              >
                Visit the website
              </a>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}
