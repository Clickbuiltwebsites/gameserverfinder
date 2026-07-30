import Link from "next/link";
import type { Metadata } from "next";
import { ListingForm } from "@/components/listing-form";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "List a server",
  description:
    "Publish a DayZ, FiveM, Minecraft or Rust server listing with a picture, player numbers, region and playstyle.",
};

export default async function SubmitPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <div className="shell auth">
        <h1 className="auth__title">Sign in to list a server</h1>
        <p className="auth__lede">
          Listings are tied to an account so you can edit or remove yours later, and so nobody
          else can publish under your server&rsquo;s name.
        </p>
        <Link className="btn btn--primary btn--block" href="/signin">
          Sign in
        </Link>
      </div>
    );
  }

  return (
    <div className="shell rail">
      <div className="rail__head">
        <div>
          <h1 className="rail__title">List a server</h1>
          <p className="rail__note" style={{ marginBlockStart: "var(--space-2xs)" }}>
            Everything here is editable afterwards. Signed in as {user.name ?? user.email}.
          </p>
        </div>
      </div>

      <ListingForm />
    </div>
  );
}
