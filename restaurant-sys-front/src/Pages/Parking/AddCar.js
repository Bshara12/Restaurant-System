import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";
import { toast } from "react-toastify";

export default function AddCar() {
  const navigate = useNavigate();
  const [carNumber, setCarNumber] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!carNumber) {
      toast.error("الرجاء إدخال رقم السيارة");
      return;
    }
    setSubmitting(true);
    try {
      const token = Cookies.get("authToken") || localStorage.getItem("token");
      const res = await fetch("http://127.0.0.1:8000/api/Employee/CreateParking", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          "n-car": carNumber,
          description: description,
        }),
      });

      if (!res.ok) {
        const txt = await res.text();
        throw new Error(txt || `Create failed: ${res.status}`);
      }

      toast.success("تمت إضافة المركبة بنجاح");
      // انتقل إلى صفحة QR الخاصة برقم السيارة بعد الإضافة
      navigate(`/Parking/dashboard/car/qr/${encodeURIComponent(carNumber)}`);
    } catch (err) {
      console.error(err);
      toast.error("فشل في إضافة المركبة");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{ padding: 20, minHeight: "100%" ,width:'79%'}}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <button
          onClick={() => navigate(-1)}
          style={{
            border: "1px solid #334155",
            background: "#0f172a",
            color: "#e2e8f0",
            borderRadius: 8,
            padding: "6px 10px",
            cursor: "pointer",
          }}
        >
          ← Back
        </button>
        <h2 style={{ margin: 0, color: "#f3f4f6", background: "linear-gradient(90deg, #d97706, #fbbf24)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>
          Add Vehicle
        </h2>
      </div>

      <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
        <form onSubmit={handleSubmit}
          style={{
            padding: 16,
            border: "1px solid #334155",
            borderRadius: 12,
            background: "#0b1220",
            color: "#e2e8f0",
            width: "min(90vw, 520px)",
          }}
        >
        <div style={{ marginBottom: 12 }}>
          <label htmlFor="carNumber" style={{ display: "block", marginBottom: 6, color: "#fbbf24" }}>
            رقم السيارة (n-car)
          </label>
          <input
            id="carNumber"
            type="text"
            value={carNumber}
            onChange={(e) => setCarNumber(e.target.value)}
            placeholder="مثال: 111111"
            style={{
              width: "90%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
              outline: "none",
            }}
          />
        </div>

        <div style={{ marginBottom: 12 }}>
          <label htmlFor="description" style={{ display: "block", marginBottom: 6, color: "#fbbf24" }}>
            الوصف (description)
          </label>
          <textarea
            id="description"
            rows={4}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="اكتب وصفاً للمركبة..."
            style={{
              width: "90%",
              padding: "10px 12px",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
              outline: "none",
              resize: "vertical",
            }}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
          <button
            type="button"
            onClick={() => navigate(-1)}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "1px solid #334155",
              background: "#0f172a",
              color: "#e2e8f0",
              cursor: "pointer",
            }}
          >
            إلغاء
          </button>
          <button
            type="submit"
            disabled={submitting}
            style={{
              padding: "10px 14px",
              borderRadius: 10,
              border: "2px solid #f59e0b",
              background: submitting ? "#6b7280" : "linear-gradient(135deg, #f59e0b, #d97706)",
              color: "#111827",
              fontWeight: 700,
              cursor: submitting ? "not-allowed" : "pointer",
              minWidth: 120,
            }}
          >
            {submitting ? "جاري الإضافة..." : "إضافة المركبة"}
          </button>
        </div>
        </form>
      </div>
    </div>
  );
}
