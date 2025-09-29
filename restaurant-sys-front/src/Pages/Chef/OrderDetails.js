import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "../../css/orders.css";

const API_DETAILS_BASE = "http://127.0.0.1:8000/api/Employee/getOrderDetails";

function normalizeStatus(s) {
  if (!s) return "";
  const v = String(s).toLowerCase();
  if (v === "padding") return "pending";
  return v;
}

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

export default function OrderDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (!id) return;
    const token = Cookies.get("authToken") || localStorage.getItem("token");
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(`${API_DETAILS_BASE}/${id}`, {
      method: "GET",
      headers: token
        ? {
            Authorization: ` Bearer ${token}`,
          }
        : undefined,
      signal: controller.signal,
    })
      .then(async (res) => {
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        if (json && typeof json === "object") {
          json.status = normalizeStatus(json.status);
        }
        setData(json);
        console.log("[OrderDetails] fetched order:", json);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError("فشل في جلب تفاصيل الطلب");
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, [id]);

  const order = data || {};

  useEffect(() => {
    if (data) {
      console.log("[OrderDetails] data changed:", data);
    }
  }, [data]);

  const nextStatusAndLabel = (() => {
    const st = normalizeStatus(order.status);
    if (st === "pending") return { next: "making", label: "ابدأ التحضير" };
    if (st === "making") return { next: "done", label: "تم الإنجاز" };
    return { next: null, label: "منتهي" };
  })();

  const handleChangeStatus = async () => {
    if (!nextStatusAndLabel.next) return;
    try {
      setUpdating(true);
      const token = Cookies.get("authToken") || localStorage.getItem("token");
      const res = await fetch(
        `http://127.0.0.1:8000/api/Employee/EditOrder/${id}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            ...(token ? { Authorization: ` Bearer ${token}` } : {}),
          },
        }
      );
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      toast.success("تم تحديث حالة الطلب بنجاح");
      // Update local view
      setData((prev) => ({ ...(prev || {}), status: nextStatusAndLabel.next }));
    } catch (e) {
      toast.error("فشل تحديث حالة الطلب");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="order-details-container">
      <div className="details-header">
        <button className="back-btn" onClick={() => navigate(-1)}>
          <i className="fa-solid fa-arrow-left"></i>
          <span>رجوع</span>
        </button>
        <div className="title-wrap">
          <h2>Order #{order.order_id || id}</h2>
          <span className={statusClass(order.status)}>
            {String(order.status || "").toUpperCase()}
          </span>
        </div>
      </div>

      {loading && <div className="state-msg">جاري التحميل...</div>}
      {error && !loading && <div className="state-msg error">{error}</div>}

      {!loading && !error && (
        <div className="details-content fade-in">
          <div className="details-row">
            <div>
              <span className="label">Table</span>
              <div className="value">{order.table_number}</div>
            </div>
            <div>
              <span className="label">ETA</span>
              <div className="value">{order.time_to_make}</div>
            </div>
            <div>
              <span className="label">Status</span>
              <div className="value">{order.status}</div>
            </div>
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button
              onClick={handleChangeStatus}
              disabled={!nextStatusAndLabel.next || updating}
              className="back-btn"
              style={{
                backgroundColor: nextStatusAndLabel.next ? "#fffbeb" : "#f3f4f6",
                color: nextStatusAndLabel.next ? "#92400e" : "#6b7280",
                borderColor: nextStatusAndLabel.next ? "rgba(212,175,55,.5)" : "#e5e7eb",
              }}
            >
              {updating ? "جارِ التحديث..." : nextStatusAndLabel.label}
            </button>
          </div>

          <div className="items-section">
            <h3>Items</h3>
            <div className="items-list">
              {(order.items || []).map((it, idx) => (
                <div className="details-item" key={idx}>
                  <div className="left">
                    <div className="name">{it.food_name}</div>
                    {it.description && (
                      <div className="desc">{it.description}</div>
                    )}
                  </div>
                  <div className="right">x{it.quantity}</div>
                </div>
              ))}
              {(order.items || []).length === 0 && (
                <div className="state-msg">لا توجد عناصر في الطلب</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
