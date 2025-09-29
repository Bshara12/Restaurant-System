import { useParams, useNavigate } from "react-router-dom";

export default function CarQR() {
  const { carNumber } = useParams();
  const navigate = useNavigate();

  const data = String(carNumber || "");
  // Use a QR code generation API to render the QR as an image
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(
    data
  )}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ padding: 20 ,width:'100vw'}}>
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
        <h2
          style={{
            margin: 0,
            color: "#f3f4f6",
            background: "linear-gradient(90deg, #d97706, #fbbf24)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
          }}
        >
          Car QR Code
        </h2>
      </div>

      <div
        style={{
          marginTop: 24,
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <div
          style={{
            border: "1px solid #334155",
            background: "#0b1220",
            padding: 20,
            borderRadius: 12,
          }}
        >
          <div style={{ textAlign: "center", marginBottom: 12, color: "#e2e8f0" }}>
            <div style={{ fontSize: 14, opacity: 0.8 }}>Car Number</div>
            <div style={{ fontSize: 24, fontWeight: 800, color: "#fbbf24" }}>{data}</div>
          </div>
          <img src={qrUrl} alt={`QR for ${data}`} style={{ width: 300, height: 300, display: "block" }} />
          <div style={{ display: "flex", justifyContent: "center", marginTop: 16 }}>
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
        </div>
      </div>
    </div>
  );
}
