import Link from "next/link";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Check your email",
  robots: { index: false, follow: false },
};

export default function CheckEmailPage() {
  return (
    <div className="shell auth">
      <h1 className="auth__title">Check your email</h1>
      <p className="auth__lede">
        A sign-in link is on its way. It works once and expires after 15 minutes. If it has not
        arrived in a couple of minutes, look in the spam folder — magic-link mail lands there more
        often than it should.
      </p>
      <Link className="btn" href="/signin">
        Use a different address
      </Link>
    </div>
  );
}
