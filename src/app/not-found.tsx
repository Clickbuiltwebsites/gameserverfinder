import Link from "next/link";

export default function NotFound() {
  return (
    <div className="shell auth">
      <h1 className="auth__title">That page is not here.</h1>
      <p className="auth__lede">
        The listing may have been removed by its owner, or the address may be mistyped.
      </p>
      <Link className="btn btn--primary btn--block" href="/servers">
        Browse all servers
      </Link>
    </div>
  );
}
