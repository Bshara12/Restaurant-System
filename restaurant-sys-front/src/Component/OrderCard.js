import React from "react";

function statusClass(status) {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "status-badge pending";
    case "making":
      return "status-badge making";
    case "done":
      return "status-badge done";
    default:
      return "status-badge";
  }
}

function cardClass(status) {
  switch ((status || "").toLowerCase()) {
    case "pending":
      return "order-card card-pending fade-in";
    case "making":
      return "order-card card-making fade-in";
    case "done":
      return "order-card card-done fade-in";
    default:
      return "order-card fade-in";
  }
}

export default function OrderCard({ order, onClick, style, showWaiterActions = false, onDone, onDelivered }) {
  const {
    order_id,
    status,
    time_to_make,
    table_number,
    items = [],
  } = order || {};

  const cardRef = React.useRef(null);

  // When waiter actions are wired but hidden, clicking the card should progress status
  const handleCardClick = (e) => {
    // If waiter actions handlers are provided while actions are hidden, use click to progress status
    const hasActionHandlers = !!onDone || !!onDelivered;
    if (!showWaiterActions && hasActionHandlers) {
      e.preventDefault();
      e.stopPropagation();
      const st = String(status || '').toLowerCase();
      if (st === 'done') {
        onDelivered && onDelivered(order);
      } else if (st !== 'delivered') {
        // From any non-delivered state, move to done first
        onDone && onDone(order);
      }
      return;
    }
    // default behavior (navigate/open details)
    onClick && onClick(e);
  };

  const handleMouseMove = (e) => {
    const el = cardRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    el.style.setProperty("--mx", `${x}%`);
  };

  const handleMouseLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    el.style.removeProperty("--mx");
  };

  return (
    <div
      ref={cardRef}
      className={cardClass(status)}
      onClick={handleCardClick}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      role="button"
      tabIndex={0}
      style={style}
    >
      <div className="order-card-header">
        <div className="order-title">
          <span className="order-id">#{order_id}</span>
          <span className={statusClass(status)}>
            {showWaiterActions ? (String(status).toUpperCase()) : (String(status).toUpperCase())}
          </span>
        </div>
        <div className="order-meta">
          <span className="order-table">{showWaiterActions ? "Table" : "Table"}: {table_number}</span>
          <span className="order-time">{showWaiterActions ? "Time" : "ETA"}: {time_to_make}</span>
        </div>
      </div>
      <div className="order-items">
        {items.slice(0, 3).map((it, idx) => (
          <div className="order-item" key={idx}>
            <span className="item-name">{it.food_name}</span>
            <span className="item-qty">x{it.quantity}</span>
            {it.description ? (
              <span className="item-desc">{it.description}</span>
            ) : null}
          </div>
        ))}
        {items.length > 3 && (
          <div className="more-items">+{items.length - 3} more...</div>
        )}
      </div>
      {showWaiterActions && (
        <div className="order-actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 8 }}>
          <button
            className="order-btn done"
            onClick={(e) => { e.stopPropagation(); onDone && onDone(order); }}
            style={{
              background: '#1976d2', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer'
            }}
          >
            Done
          </button>
          <button
            className="order-btn delivered"
            onClick={(e) => { e.stopPropagation(); onDelivered && onDelivered(order); }}
            style={{
              background: '#2e7d32', color: '#fff', border: 'none', padding: '6px 10px', borderRadius: 6, cursor: 'pointer'
            }}
          >
            تم التسليم
          </button>
        </div>
      )}
    </div>
  );
}
