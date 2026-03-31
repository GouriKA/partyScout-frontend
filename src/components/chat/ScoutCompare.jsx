import './ScoutCompare.css';

export default function ScoutCompare({ venues, onSelect, onClose }) {
  if (!venues?.length) return null;

  return (
    <div className="sc-overlay">
      <div className="sc-modal">
        <div className="sc-header">
          <span className="sc-title">Compare venues</span>
          <button className="sc-close" onClick={onClose} aria-label="Close">✕</button>
        </div>
        <div className="sc-grid" style={{ gridTemplateColumns: `repeat(${venues.length}, 1fr)` }}>
          {venues.map((v) => (
            <div key={v.num} className="sc-col">
              <div className="sc-num">{v.num}</div>
              <div className="sc-photo">
                {v.photos?.[0] ? (
                  <img src={v.photos[0]} alt={v.name} loading="lazy" />
                ) : (
                  <div className="sc-photo-empty">🎉</div>
                )}
              </div>
              <div className="sc-name">{v.name}</div>

              <div className="sc-rows">
                <div className="sc-row">
                  <span className="sc-row-label">Rating</span>
                  <span className="sc-row-val">
                    {v.rating > 0 ? <><span className="sc-star">★</span> {v.rating.toFixed(1)}</> : '—'}
                  </span>
                </div>
                <div className="sc-row">
                  <span className="sc-row-label">Setting</span>
                  <span className="sc-row-val" style={{ textTransform: 'capitalize' }}>{v.setting || '—'}</span>
                </div>
                <div className="sc-row">
                  <span className="sc-row-label">Address</span>
                  <span className="sc-row-val sc-row-val--small">{v.address || '—'}</span>
                </div>
                {v.reason && (
                  <div className="sc-row">
                    <span className="sc-row-label">Vibe</span>
                    <span className="sc-row-val sc-row-val--pink">{v.reason}</span>
                  </div>
                )}
              </div>

              {onSelect && (
                <button className="sc-select-btn" onClick={() => onSelect(v)}>
                  View details →
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
