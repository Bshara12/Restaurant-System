import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import OrderCard from "../../Component/OrderCard";
import "../../css/orders.css";
import { toast } from "react-toastify";

const API_ALL = "http://127.0.0.1:8000/api/Employee/getAllOrders";

function normalizeStatus(s) {
  if (!s) return "";
  const v = String(s).toLowerCase();
  if (v === "padding") return "pending"; // handle typo from backend
  if (v === "تم التسليم" || v === "delivered") return "delivered";
  return v;
}

export default function Orders() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [filter, setFilter] = useState("all"); // all | pending | making | done
  const role = Cookies.get("role");
  const isChef = role === "chef" || role === "Chef";
  const isWaiter = role === "Waiters" || role === "waiters";

  useEffect(() => {
    const token = Cookies.get("authToken") || localStorage.getItem("token");
    const controller = new AbortController();
    setLoading(true);
    setError("");

    fetch(API_ALL, {
      method: "GET",
      headers: token
        ? {
            Authorization: ` Bearer ${token}`,
          }
        : undefined,
      signal: controller.signal,
    })
      .then(async (res) => {
        console.log(res)
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        const normalized = Array.isArray(data)
          ? data.map((o) => ({ ...o, status: normalizeStatus(o.status) }))
          : [];
        setOrders(normalized);
      })
      .catch((e) => {
        if (e.name !== "AbortError") setError(e.statusText);
      })
      .finally(() => setLoading(false));

    return () => controller.abort();
  }, []);

  const filtered = useMemo(() => {
    // Base dataset may be restricted by role
    const base = isWaiter
      ? orders.filter((o) => {
          const st = normalizeStatus(o.status);
          return st === "done" || st === "delivered";
        })
      : orders.filter((o) => normalizeStatus(o.status) !== "delivered");

    if (filter === "all") return base;
    return base.filter((o) => normalizeStatus(o.status) === filter);
  }, [orders, filter, isWaiter]);

  const callEditOrder = async (orderId) => {
    const token = Cookies.get("authToken") || localStorage.getItem("token");
    const res = await fetch(
      `http://127.0.0.1:8000/api/Employee/EditOrder/${orderId}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: ` Bearer ${token}` } : {}),
        },
      }
    );
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
  };

  const handleDone = async (order) => {
    try {
      await callEditOrder(order.order_id);
      // نجاح: حدّث الحالة محلياً
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === order.order_id ? { ...o, status: "done" } : o
        )
      );
      toast.success(`Order #${order.order_id} marked as Done`);
    } catch (e) {
      toast.error("فشل تحديث حالة الطلب");
    }
  };

  const handleDelivered = async (order) => {
    try {
      await callEditOrder(order.order_id);
      // نجاح: حدّث الحالة محلياً
      setOrders((prev) =>
        prev.map((o) =>
          o.order_id === order.order_id ? { ...o, status: "delivered" } : o
        )
      );
      toast.success(`Order #${order.order_id} تم التسليم`);
    } catch (e) {
      toast.error("فشل تحديث حالة الطلب");
    }
  };

  return (
    <div className="orders-container page-enter">
      <div className="orders-header">
        <h2>Orders</h2>
        <div className="filters">
          {isWaiter ? (
            <>
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                all
              </button>
              <button
                className={`filter-btn ${filter === "done" ? "active" : ""}`}
                onClick={() => setFilter("done")}
              >
                done
              </button>
              <button
                className={`filter-btn ${filter === "delivered" ? "active" : ""}`}
                onClick={() => setFilter("delivered")}
              >
                تم التسليم
              </button>
            </>
          ) : (
            <>
              <button
                className={`filter-btn ${filter === "all" ? "active" : ""}`}
                onClick={() => setFilter("all")}
              >
                All
              </button>
              <button
                className={`filter-btn ${filter === "pending" ? "active" : ""}`}
                onClick={() => setFilter("pending")}
              >
                Pending
              </button>
              <button
                className={`filter-btn ${filter === "making" ? "active" : ""}`}
                onClick={() => setFilter("making")}
              >
                Making
              </button>
              <button
                className={`filter-btn ${filter === "done" ? "active" : ""}`}
                onClick={() => setFilter("done")}
              >
                Done
              </button>
            </>
          )}
        </div>
      </div>

      {loading && <div className="state-msg">جاري التحميل...</div>}
      {error && !loading && <div className="state-msg error">{error}</div>}

      {!loading && !error && (
        <div className="orders-grid">
          {filtered.map((order, idx) => (
            <OrderCard
              key={order.order_id}
              order={order}
              onClick={() =>
                navigate(
                  isWaiter
                    ? `/Waiters/dashboard/orders/${order.order_id}`
                    : `/Chef/dashboard/orders/${order.order_id}`
                )
              }
              showWaiterActions={false}
              onDone={isWaiter ? handleDone : undefined}
              onDelivered={isWaiter ? handleDelivered : undefined}
              style={{ animationDelay: `${idx * 70}ms` }}
            />
          ))}
          {filtered.length === 0 && (
            <div className="state-msg">لا توجد طلبات مطابقة</div>
          )}
        </div>
      )}
    </div>
  );
}