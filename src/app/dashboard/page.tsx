import Link from "next/link";
import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { ServerCard } from "@/components/server-card";
import { deleteListingAction } from "@/app/actions";
import { listListingsByOwner } from "@/lib/repo";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "My listings",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/signin");

  const listings = await listListingsByOwner(user.id);

  return (
    <div className="shell rail">
      <div className="rail__head">
        <div>
          <h1 className="rail__title">My listings</h1>
          <p className="rail__note" style={{ marginBlockStart: "var(--space-2xs)" }}>
            Signed in as {user.name ?? user.email}
            {user.demo ? " · demo session, nothing is saved to a database" : ""}.
          </p>
        </div>
        <Link className="btn btn--primary" href="/submit">
          List a server
        </Link>
      </div>

      {listings.length ? (
        <div className="grid grid--wide">
          {listings.map((listing, index) => (
            <div key={listing.id} style={{ display: "grid", gap: "var(--space-xs)" }}>
              <ServerCard listing={listing} index={index} />
              <form action={deleteListingAction}>
                <input type="hidden" name="id" value={listing.id} />
                <button type="submit" className="btn btn--danger btn--block">
                  Remove {listing.name}
                </button>
              </form>
            </div>
          ))}
        </div>
      ) : (
        <div className="empty">
          <h2 className="empty__title">You have not listed a server yet.</h2>
          <p className="empty__body">
            A listing is how players find you before they find your Discord. It takes about two
            minutes, and you can edit or remove it whenever you want.
          </p>
          <Link className="btn btn--primary" href="/submit">
            List a server
          </Link>
        </div>
      )}
    </div>
  );
}
