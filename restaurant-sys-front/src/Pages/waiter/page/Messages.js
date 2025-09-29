import { useEffect, useMemo, useState } from "react";
import Cookies from "js-cookie";

export default function WaiterMessages() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [confirmMsg, setConfirmMsg] = useState(null); // message to confirm delete

  const fetchMessages = async () => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("authToken") || localStorage.getItem("token");
      const res = await fetch(
        "http://127.0.0.1:8000/api/Employee/getRestaurantMessages",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        }
      );
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }
      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      setMessages(list);
    } catch (e) {
      setError(e.message || "Failed to load messages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    // Optional: auto refresh every 15s
    const id = setInterval(fetchMessages, 15000);
    return () => clearInterval(id);
  }, []);

  const sorted = useMemo(() => {
    // Sort by created_at desc if available
    return [...messages].sort((a, b) => {
      const da = new Date(a?.created_at || 0).getTime();
      const db = new Date(b?.created_at || 0).getTime();
      return db - da;
    });
  }, [messages]);

  const confirmDelete = async () => {
    if (!confirmMsg?.id) return;
    try {
      const token = Cookies.get("authToken") || localStorage.getItem("token");
      const res = await fetch(`http://127.0.0.1:8000/api/Employee/deleteMessage/${confirmMsg.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });
      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Delete failed: ${res.status}`);
      }
      setConfirmMsg(null);
      await fetchMessages();
    } catch (e) {
      console.error(e);
      alert("فشل حذف الرسالة");
    }
  };

  return (
    <div style={{ padding: 20, width: "79%", minHeight: "100%" }}>
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { background-position: -450px 0 }
          100% { background-position: 450px 0 }
        }
        .card-anim { animation: fadeInUp 280ms ease forwards; }
        .skeleton {
          background: #1f2937;
          background-image: linear-gradient(90deg, #1f2937 0px, #374151 40px, #1f2937 80px);
          background-size: 600px;
          animation: shimmer 1.3s infinite linear;
        }
        .badge {
          display: inline-block;
          padding: 4px 10px; border-radius: 12px; font-weight: 700; font-size: 12px;
          background: #f59e0b22; color: #f59e0b;
        }
      `}</style>

      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <h2 style={{ margin: 0, background: "linear-gradient(90deg, #d97706, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Customer Messages
        </h2>
        <button
          onClick={fetchMessages}
          className="btn-anim"
          style={{
            padding: "8px 12px",
            borderRadius: 10,
            border: "2px solid #f59e0b",
            background: "linear-gradient(135deg, #f59e0b, #d97706)",
            color: "#111827",
            cursor: "pointer",
            fontWeight: 800,
          }}
        >
          <i className="fa-solid fa-rotate"></i>
          <span style={{ marginLeft: 6 }}>Refresh</span>
        </button>
      </div>

      {loading && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 16 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="skeleton" style={{ height: 120, borderRadius: 14, border: "1px solid #334155" }} />
          ))}
        </div>
      )}

      {!loading && error && (
        <div style={{ background: "#fee2e2", color: "#991b1b", padding: 12, borderRadius: 10, border: "1px solid #fecaca" }}>
          {error}
        </div>
      )}

      {!loading && !error && sorted.length === 0 && (
        <div style={{
          background: "#0b1220", color: "#fbbf24", padding: 16, borderRadius: 12,
          border: "1px solid #334155", textAlign: "center", fontWeight: 700
        }}>
          لا توجد رسائل حالياً
        </div>
      )}

      {!loading && !error && sorted.length > 0 && (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 16,
        }}>
          {sorted.map((m, idx) => (
            <div
              key={m?.id || idx}
              className="card-anim"
              style={{
                border: "1px solid #334155",
                borderRadius: 16,
                padding: 16,
                background: "#0b1220",
                boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
                animationDelay: `${idx * 40}ms`,
              }}
            >
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                <div style={{ fontWeight: 800, color: "#f3f4f6" }}>
                  <i className="fa-solid fa-bell" style={{ color: "#f59e0b", marginRight: 8 }}></i>
                  رسالة من الطاولة #{m?.table_number ?? "—"}
                </div>
                <span className="badge">ID: {m?.id}</span>
              </div>
              <div style={{ marginTop: 10, color: "#e5e7eb" }}>{m?.message ?? "—"}</div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                {new Date(m?.created_at).toLocaleString()}
              </div>
              <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                <button
                  className="btn-anim"
                  onClick={() => setConfirmMsg(m)}
                  title="حذف الرسالة"
                  style={{
                    padding: "8px 10px",
                    borderRadius: 10,
                    border: "1px solid #ef4444",
                    background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 700,
                    minWidth: 120,
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                  <span style={{ marginLeft: 6 }}>حذف</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {confirmMsg && (
        <div
          className="popup-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 100,
          }}
          onClick={() => setConfirmMsg(null)}
        >
          <div
            className="popup-box card-anim"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1f2937",
              color: "#f9fafb",
              padding: 20,
              borderRadius: 14,
              width: "min(92vw, 420px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.35)",
              border: "1px solid #f59e0b55",
            }}
          >
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>تأكيد حذف الرسالة</h3>
            <p style={{ marginTop: 0 }}>
              هل تريد حذف رسالة الطاولة رقم <b>{confirmMsg?.table_number}</b>؟
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={() => setConfirmMsg(null)}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "1px solid #9ca3af",
                  background: "#374151",
                  color: "#e5e7eb",
                  cursor: "pointer",
                }}
              >
                إلغاء
              </button>
              <button
                onClick={confirmDelete}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "2px solid #ef4444",
                  background: "linear-gradient(135deg, #ef4444, #b91c1c)",
                  color: "#fff",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
