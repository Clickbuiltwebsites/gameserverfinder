/**
 * Every filter chip is a link to a server-rendered page, so without a boundary
 * a click sat visually inert until the round-trip finished. This gives the
 * router something to show immediately and something to prefetch to.
 */
export default function LoadingServers() {
  return (
    <div className="shell browse" aria-busy="true">
      <div className="filters">
        {[0, 1, 2].map((i) => (
          <div key={i} className="skeleton-group">
            <span className="skeleton skeleton--label" />
            <div className="chips">
              {[0, 1, 2, 3].map((j) => (
                <span key={j} className="skeleton skeleton--chip" />
              ))}
            </div>
          </div>
        ))}
      </div>

      <section>
        <div className="results__head">
          <span className="skeleton skeleton--title" />
        </div>
        <div className="grid grid--wide">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="card">
              <div className="card__media skeleton skeleton--media" />
              <div className="card__body">
                <span className="skeleton skeleton--line" />
                <span className="skeleton skeleton--line skeleton--short" />
              </div>
            </div>
          ))}
        </div>
        <p className="visually-hidden" role="status">
          Loading servers…
        </p>
      </section>
    </div>
  );
}
