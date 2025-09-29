import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export default function Cars() {
  const [cars, setCars] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | parked | delivered | being_fetched
  const [showConfirm, setShowConfirm] = useState(false);
  const [selectedCar, setSelectedCar] = useState(null);
  const [qrModalCar, setQrModalCar] = useState(null);
  const navigate = useNavigate();
  const deleteTimers = useRef(new Map()); // id -> timeoutId

  const fetchCars = async () => {
    setLoading(true);
    setError("");
    try {
      const token = Cookies.get("authToken") || localStorage.getItem("token");
      const res = await fetch(
        "http://127.0.0.1:8000/api/Employee/GetRestaurantParkings",
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        }
      );

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Request failed: ${res.status}`);
      }

      const json = await res.json();
      const list = Array.isArray(json?.data) ? json.data : [];
      setCars(list);
    } catch (e) {
      setError(e.message || "Failed to load cars");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCars();
  }, []);

  const renderStatusBadge = (status) => {
    const normalized = String(status || "").toLowerCase();
    // Palette emphasis: gold/yellow/orange/gray/black
    let color = "#6b7280"; // default gray-500
    if (normalized === "parked") color = "#f59e0b"; // amber-500
    else if (normalized === "delivered") color = "#22c55e"; // green-500
    else if (normalized === "being_fetched") color = "#fbbf24"; // amber-400
    else if (normalized === "done") color = "#d97706"; // amber-600
    return (
      <span
        style={{
          display: "inline-block",
          padding: "4px 10px",
          borderRadius: 12,
          background: color + "22",
          color,
          fontSize: 12,
          fontWeight: 600,
          textTransform: "capitalize",
        }}
      >
        {normalized || "unknown"}
      </span>
    );
  };

  const openConfirm = (car) => {
    const st = String(car?.status || "").toLowerCase();
    // لا تفتح نافذة التأكيد إذا كانت الحالة تم التوصيل
    if (st === "delivered") {
      toast.info("هذه المركبة حالتها 'تم التوصيل' ولا يمكن تغييرها.");
      return;
    }
    setSelectedCar(car);
    setShowConfirm(true);
  };

  const closeConfirm = () => {
    setShowConfirm(false);
    setSelectedCar(null);
  };

  const openQR = (car) => setQrModalCar(car);
  const closeQR = () => setQrModalCar(null);

  const handleDelete = async (car) => {
    if (!car?.id) return;
    try {
      const token = Cookies.get("authToken") || localStorage.getItem("token");
      const delRes = await fetch(
        `http://127.0.0.1:8000/api/Employee/deleteCar/${car.id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        }
      );
      if (!delRes.ok) {
        const txt = await delRes.text();
        throw new Error(txt || `Delete failed: ${delRes.status}`);
      }
      toast.success("تم حذف المركبة");
      await fetchCars();
    } catch (err) {
      console.error(err);
      toast.error("فشل حذف المركبة");
    }
  };

  const handleUpdateStatus = async () => {
    if (!selectedCar) return;
    try {
      const token = Cookies.get("authToken") || localStorage.getItem("token");
      const carNumber = selectedCar?.["n-car"]; // using n-car as in API example
      const url = `http://127.0.0.1:8000/api/parking/update-status/${carNumber}`;
      const res = await fetch(url, {
        method: "GET",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `Update failed: ${res.status}`);
      }

      toast.success("تم تحديث حالة المركبة بنجاح");
      closeConfirm();
      await fetchCars();
      return;
    } catch (e) {
      toast.error("فشل تحديث الحالة");
      console.error(e);
    }
  };

  // Schedule deletion for cars in status 'done' after 13s
  useEffect(() => {
    const token = Cookies.get("authToken") || localStorage.getItem("token");

    const scheduleDelete = (id) => {
      if (deleteTimers.current.has(id)) return; // avoid duplicate timers
      toast.info(`سيتم حذف المركبة رقم ${id} بعد 13 ثانية`);
      const timeoutId = setTimeout(async () => {
        try {
          const delRes = await fetch(
            `http://127.0.0.1:8000/api/Employee/deleteCar/${id}`,
            {
              method: "DELETE",
              headers: {
                Authorization: `Bearer ${token}`,
                Accept: "application/json",
              },
            }
          );
          if (!delRes.ok) {
            const txt = await delRes.text();
            throw new Error(txt || `Delete failed: ${delRes.status}`);
          }
          toast.success("تم حذف المركبة بحالة done بعد 13 ثانية");
          await fetchCars();
        } catch (err) {
          console.error(err);
          toast.error("فشل حذف المركبة بحالة done");
        } finally {
          deleteTimers.current.delete(id);
        }
      }, 13000);
      deleteTimers.current.set(id, timeoutId);
    };

    // For each car, if status is 'done' schedule delete; otherwise clear timer if exists
    const currentIds = new Set();
    cars.forEach((car) => {
      const id = car?.id;
      const st = String(car?.status || "").toLowerCase();
      if (!id) return;
      currentIds.add(id);
      if (st === "delivered") {
        scheduleDelete(id);
      } else if (deleteTimers.current.has(id)) {
        clearTimeout(deleteTimers.current.get(id));
        deleteTimers.current.delete(id);
      }
    });

    // لا تقم بتنظيف كل المؤقتات هنا لأن هذا المؤثر يُستدعى عند كل تحديث للبيانات
    // والتنظيف الكامل سيُلغي المؤقتات قبل تنفيذها. نعالج الإلغاء بشكل انتقائي أعلاه.
  }, [cars]);

  // Cleanup on unmount only: clear all timers
  useEffect(() => {
    return () => {
      deleteTimers.current.forEach((t) => clearTimeout(t));
      deleteTimers.current.clear();
    };
  }, []);

  // Apply filter
  const filteredCars = cars.filter((item) => {
    const st = String(item?.status || "").toLowerCase();
    if (filter === "all") return true;
    if (filter === "being_fetched") return st === "being_fetched";
    return st === filter;
  });

  return (
    <div style={{ padding: 20, width: "79%", background: "#1118270a", minHeight: "100%" }}>
      {/* Animations */}
      <style>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes pop {
          from { transform: scale(0.95); opacity: 0; }
          to { transform: scale(1); opacity: 1; }
        }
        /* Shakes quickly, then rests; total cycle is 2s */
        @keyframes shake-burst {
          0%, 80%, 100% { transform: translate(0, 0) rotate(0deg); }
          82% { transform: translate(-1px, 0) rotate(-2deg); }
          84% { transform: translate(2px, 0) rotate(2deg); }
          86% { transform: translate(-2px, 0) rotate(-2deg); }
          88% { transform: translate(2px, 0) rotate(2deg); }
          90% { transform: translate(-1px, 0) rotate(-1deg); }
          92% { transform: translate(1px, 0) rotate(1deg); }
          94% { transform: translate(0, 0) rotate(0deg); }
        }
        .card-anim { animation: fadeInUp 300ms ease forwards; }
        .btn-anim { transition: transform 120ms ease, box-shadow 120ms ease; }
        .btn-anim:hover { transform: translateY(-1px); box-shadow: 0 6px 16px rgba(0,0,0,0.25); }
        .btn-anim:active { transform: translateY(0); }
        .modal-anim { animation: pop 200ms ease forwards; }
        .fab-shake { animation: shake-burst 2s ease-in-out infinite; transform-origin: center; }
      `}</style>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          marginBottom: 16,
        }}
      >
        <h2 style={{ margin: 0, color: "#f3f4f6", background: "linear-gradient(90deg, #d97706, #fbbf24)", WebkitBackgroundClip: "text", colorAdjust: "exact", WebkitTextFillColor: "transparent" }}>
          Parking cars
        </h2>

        {/* Filters */}
        <div style={{ display: "flex", gap: 8 }}>
          <button
            onClick={() => setFilter("all")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: filter === "all" ? "2px solid #f59e0b" : "1px solid #334155",
              background: filter === "all" ? "linear-gradient(135deg, #d97706, #f59e0b)" : "#0f172a",
              color: "#f3f4f6",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            All
          </button>
          <button
            onClick={() => setFilter("delivered")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: filter === "delivered" ? "2px solid #d97706" : "1px solid #334155",
              background: filter === "delivered" ? "linear-gradient(135deg, #f59e0b, #d97706)" : "#0f172a",
              color: "#f3f4f6",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Delivered
          </button>
          <button
            onClick={() => setFilter("being_fetched")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: filter === "being_fetched" ? "2px solid #fbbf24" : "1px solid #334155",
              background: filter === "being_fetched" ? "linear-gradient(135deg, #fde68a, #fbbf24)" : "#0f172a",
              color: "#f3f4f6",
              cursor: "pointer",
              fontWeight: 700,
            }}
          >
            being_fetched
          </button>
          <button
            onClick={() => setFilter("parked")}
            style={{
              padding: "8px 12px",
              borderRadius: 10,
              border: filter === "parked" ? "2px solid #f59e0b" : "1px solid #334155",
              background: filter === "parked" ? "linear-gradient(135deg, #f59e0b, #fbbf24)" : "#0f172a",
              color: "#f3f4f6",
              cursor: "pointer",
              fontWeight: 600,
            }}
          >
            Parked
          </button>
        </div>
      </div>

      {loading && <p>Loading...</p>}
      {error && (
        <div
          style={{
            background: "#fee2e2",
            color: "#991b1b",
            padding: 12,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          {error}
        </div>
      )}

      {!loading && !error && filteredCars.length === 0 && (
        <div
          style={{
            background: "rgb(104 104 104)",
            color: "gold",
            padding: 16,
            borderRadius: 8,
            marginBottom: 12,
          }}
        >
          لا توجد سيارات مطابقة للفلترة
        </div>
      )}

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: 18,
        }}
      >
        {filteredCars.map((item, idx) => (
          <div
            key={item?.id}
            onClick={() => openConfirm(item)}
            style={{
              position: "relative",
              border: "1px solid #334155",
              borderRadius: 16,
              padding: 16,
              background: "#0b1220",
              boxShadow: "0 6px 18px rgba(0,0,0,0.25)",
              cursor: "pointer",
              transition: "transform 0.15s ease, box-shadow 0.15s ease, border-color 0.15s ease",
              animationDelay: `${idx * 40}ms`,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-2px)";
              e.currentTarget.style.boxShadow = "0 14px 32px rgba(0,0,0,0.45)";
              e.currentTarget.style.borderColor = "#f59e0b";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0 6px 18px rgba(0,0,0,0.25)";
              e.currentTarget.style.borderColor = "#334155";
            }}
            className="card-anim"
          >
            {/* Top golden accent */}
            <div
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: 4,
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                background: "linear-gradient(90deg, #f59e0b, #d97706)",
              }}
            />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <div style={{ fontWeight: 800, fontSize: 18, color: "#f3f4f6" }}>
                #{item?.id} — {item?.["n-car"]}
              </div>
              {renderStatusBadge(item?.status)}
            </div>
            <div style={{ marginTop: 10, color: "#cbd5e1" }}>
              <div>
                <strong style={{ color: "#eab308" }}>Description: </strong>
                <span>{item?.discription || "—"}</span>
              </div>
              <div style={{ marginTop: 8, fontSize: 12, color: "#94a3b8" }}>
                <span>Created: {new Date(item?.created_at).toLocaleString()}</span>
              </div>
              {String(item?.status || '').toLowerCase() === 'done' && (
                <div style={{ marginTop: 8, fontSize: 12, color: "#fbbf24", display: 'flex', alignItems: 'center', gap: 6 }}>
                  <i className="fa-regular fa-clock" aria-hidden="true"></i>
                  <span>سيتم حذفها تلقائياً بعد 13 ثانية</span>
                </div>
              )}
              {/* Actions */}
              <div style={{ marginTop: 12, display: 'flex', gap: 8 }} onClick={(e)=>e.stopPropagation()}>
                <button
                  className="btn-anim"
                  onClick={(e) => { e.stopPropagation(); openQR(item); }}
                  title="عرض QR"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #f59e0b',
                    background: 'linear-gradient(135deg, #f59e0b, #d97706)',
                    color: '#111827',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 700,
                  }}
                >
                  <i className="fa-solid fa-qrcode"></i>
                  <span>QR</span>
                </button>
                <button
                  className="btn-anim"
                  onClick={(e) => { e.stopPropagation(); handleDelete(item); }}
                  title="حذف المركبة"
                  style={{
                    padding: '8px 10px',
                    borderRadius: 10,
                    border: '1px solid #ef4444',
                    background: 'linear-gradient(135deg, #ef4444, #b91c1c)',
                    color: '#fff',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontWeight: 700,
                  }}
                >
                  <i className="fa-solid fa-trash"></i>
                  <span>حذف</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Floating Action Button */}
      <button
        className="fab-shake"
        onClick={() => navigate("/Parking/dashboard/car/add")}
        title="Add vehicle"
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 56,
          height: 56,
          borderRadius: "50%",
          border: "2px solid #f59e0b",
          background: "linear-gradient(135deg, #f59e0b, #d97706)",
          color: "#fff",
          boxShadow: "0 8px 28px rgba(0,0,0,0.45)",
          cursor: "pointer",
          fontSize: 22,
        }}
      >
        <i className="fa-solid fa-plus" aria-hidden="true"></i>
      </button>

      {showConfirm && selectedCar && (
        <div
          className="popup-overlay"
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.45)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 50,
          }}
        >
          <div
            className="popup-box modal-anim"
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
            <h3 style={{ marginTop: 0, marginBottom: 8 }}>تأكيد تحديث الحالة</h3>
            <p style={{ marginTop: 0 }}>
              هل تريد تغيير حالة المركبة رقم <b>{selectedCar?.["n-car"]}</b>؟
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", marginTop: 16 }}>
              <button
                onClick={closeConfirm}
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
                onClick={handleUpdateStatus}
                style={{
                  padding: "8px 12px",
                  borderRadius: 10,
                  border: "2px solid #f59e0b",
                  background: "linear-gradient(135deg, #f59e0b, #d97706)",
                  color: "#111827",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                تأكيد
              </button>
            </div>
          </div>
        </div>
      )}

      {qrModalCar && (
        <div
          className="popup-overlay"
          onClick={closeQR}
          style={{
            position: "fixed",
            inset: 0,
            background: "rgba(0,0,0,0.6)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 60,
          }}
        >
          <div
            className="popup-box modal-anim"
            onClick={(e) => e.stopPropagation()}
            style={{
              background: "#1f2937",
              color: "#f9fafb",
              padding: 20,
              borderRadius: 14,
              width: "min(95vw, 460px)",
              boxShadow: "0 12px 40px rgba(0,0,0,0.45)",
              border: "1px solid #f59e0b55",
            }}
          >
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <h3 style={{ margin: 0 }}>رمز QR للمركبة</h3>
              <button
                onClick={closeQR}
                title="إغلاق"
                style={{
                  border: "1px solid #334155",
                  background: "#0f172a",
                  color: "#e2e8f0",
                  borderRadius: 8,
                  padding: "6px 10px",
                  cursor: "pointer",
                }}
              >
                إغلاق
              </button>
            </div>
            <div style={{ marginTop: 12, textAlign: "center" }}>
              <div style={{ fontSize: 14, opacity: 0.85 }}>رقم المركبة</div>
              <div style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>{qrModalCar?.["n-car"]}</div>
            </div>
            <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
              {(() => {
                const data = String(qrModalCar?.["n-car"] || "");
                const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(data)}`;
                const handlePrint = () => {
                  const w = window.open("", "_blank", "width=400,height=500");
                  if (!w) return;
                  const html = `<!doctype html>
                    <html>
                      <head>
                        <meta charset=\"utf-8\" />
                        <title>Print QR</title>
                        <style>
                          body{ font-family: system-ui, -apple-system, Segoe UI, Roboto, Helvetica, Arial; padding: 16px; text-align: center; }
                          .num{ font-size: 18px; margin-bottom: 8px; color: #111; }
                          img{ width: 300px; height: 300px; }
                          button{ display:none; }
                        </style>
                      </head>
                      <body>
                        <div class=\"num\">رقم المركبة: <b>${data}</b></div>
                        <img src=\"${qrUrl}\" alt=\"QR\" />
                        <script>
                          window.onload = function(){ window.print(); setTimeout(()=>window.close(), 100); };
                        </script>
                      </body>
                    </html>`;
                  w.document.open();
                  w.document.write(html);
                  w.document.close();
                };
                return (
                  <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 14 }}>
                    <img src={qrUrl} alt={`QR for ${data}`} style={{ width: 300, height: 300, display: "block", background: "#0b1220", padding: 8, borderRadius: 12, border: "1px solid #334155" }} />
                    <button
                      onClick={handlePrint}
                      style={{
                        padding: "10px 14px",
                        borderRadius: 10,
                        border: "2px solid #f59e0b",
                        background: "linear-gradient(135deg, #f59e0b, #d97706)",
                        color: "#111827",
                        fontWeight: 700,
                        cursor: "pointer",
                        minWidth: 160,
                      }}
                    >
                      طباعة QR
                    </button>
                  </div>
                );
              })()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}