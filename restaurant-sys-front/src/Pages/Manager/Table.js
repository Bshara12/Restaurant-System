import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../Restaurants.css";
import TabeCard from "../../Component/TabeCard";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Table() {
  const navigate = useNavigate();
  const [Tabels, setTabels] = useState([]);
  const [showPopup, setShowPopup] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState(null);
  const [showDeletePopup, setShowDeletePopup] = useState(false);
  const [showQRPopup, setShowQRPopup] = useState(false);
  const [selectedTableForQR, setSelectedTableForQR] = useState(null);

  const authToken = Cookies.get("authToken");
  const restaurantId = Cookies.get("restaurantId");
  const role = Cookies.get("role");
  const isManager = role === "manager" || role === "Manager";

  useEffect(() => {
    axios
      .get(
        `http://127.0.0.1:8000/api/Manager/getTableinRestaurant`,
        {
          headers: { Authorization: ` Bearer ${authToken} ` },
        }
      )
      .then((response) => {
        setTabels(response.data.tables);
        console.log(response.data.tables);
      })
      .catch((error) => console.error("Error fetching Tables:", error));
  }, []);

  const handleCardClick = (id) => {
    setSelectedTableId(id);
    setShowPopup(true);
  };

  const releaseTable = async (tableId) => {
    try {
      const response = await axios.get(
        `http://127.0.0.1:8000/api/releaseTable/${tableId}`,
        {},
        {
          headers: { 
            Authorization: `Bearer ${authToken}`,
            "Content-Type": "application/json"
          }
        }
      );
      
      console.log(`Table ${tableId} released successfully`);
      return true;
    } catch (error) {
      console.error("Error releasing table:", error);
      toast.error(`فشل في تحرير الطاولة ${tableId}`);
      return false;
    }
  };

  const handleConfirmChange = async () => {
    try {
      // الحصول على حالة الطاولة الحالية
      const currentTable = Tabels.find(table => table.id === selectedTableId);
      const wasOccupied = currentTable?.status === "occupied" || currentTable?.status === "reserved";
      
      // تحديث حالة الطاولة
      await axios.get(`http://127.0.0.1:8000/api/updateTable/${selectedTableId}`);
      
      // تحديث الحالة محلياً
      setTabels((prevTabels) =>
        prevTabels.map((table) =>
          table.id === selectedTableId
            ? {
                ...table,
                status: table.status === "vacant" ? "occupied" : "vacant",
              }
            : table
        )
      );
      
      // إذا كانت الطاولة محجوزة وأصبحت فارغة، قم بتحريرها
      if (wasOccupied) {
        await releaseTable(selectedTableId);
      }
      
      setShowPopup(false);
      toast.success("تم تغيير حالة الطاولة بنجاح!");
    } catch (error) {
      console.error("Error updating table status:", error);
      setShowPopup(false);
      toast.error("حدث خطأ أثناء تغيير الحالة.");
    }
  };

  const handleCancelChange = () => {
    setShowPopup(false);
    setSelectedTableId(null);
  };

  const handleDeleteCard = (id) => {
    setSelectedTableId(id);
    setShowDeletePopup(true);
  };

  const handleConfirmDelete = () => {
    axios
      .delete(
        `  http://127.0.0.1:8000/api/Manager/deleteTable/${selectedTableId}`,
        { headers: { Authorization: `Bearer ${authToken} ` } }
      )
      .then(() => {
        setTabels((prevTabels) =>
          prevTabels.filter((table) => table.id !== selectedTableId)
        );
        setShowDeletePopup(false);
        setSelectedTableId(null);
        toast.success("تم حذف الطاولة بنجاح!");
      })
      .catch((error) => {
        console.error("Error deleting table:", error);
        setShowDeletePopup(false);
        toast.error("حدث خطأ أثناء الحذف.");
      });
  };

  const handleCancelDelete = () => {
    setShowDeletePopup(false);
    setSelectedTableId(null);
  };

  const handleQRClick = (table) => {
    setSelectedTableForQR(table);
    setShowQRPopup(true);
  };

  const handleCloseQR = () => {
    setShowQRPopup(false);
    setSelectedTableForQR(null);
  };

  const handlePrintQR = () => {
    if (!selectedTableForQR) return;

    const qrUrl = `http://localhost:3000/${selectedTableForQR.id}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(qrUrl)}`;

    const printWindow = window.open('', '', 'width=600,height=700');
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>QR Code for Table ${selectedTableForQR.table_number}</title>
          <style>
            body { font-family: Arial, sans-serif; text-align: center; padding: 20px; }
            h2 { color: #333; }
            img { max-width: 100%; height: auto; margin: 20px 0; }
            .info { margin: 15px 0; font-size: 16px; }
          </style>
        </head>
        <body>
          <h2>Table ${selectedTableForQR.table_number}</h2>
          <div class="info">Scan to view table details</div>
          <img src="${qrCodeUrl}" alt="QR Code for Table ${selectedTableForQR.table_number}" />
          <div class="info">${window.location.hostname}/table/${selectedTableForQR.id}</div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
                window.close();
              }, 200);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="RightPare">
      <ToastContainer />
      {isManager && (
        <div className="addbutton">
          <button role="button" className="golden-button">
            <Link className="golden-text" to="/Manager/dashborad/table/addtabel">
              Add
              <i className="fa-solid fa-plus" style={{ marginLeft: "5px" }}></i>
            </Link>
          </button>
        </div>
      )}

      {/* <div className="cards">
        {Tabels.map((Tabel) => {
          const statusColor = Tabel.status === "vacant" ? "green" : "red";
          return (
            <div key={Tabel.id} style={{ position: "relative" }}>
              <TabeCard
                number={Tabel.table_number}
                status={Tabel.status}
                color={statusColor}
                onClick={() => handleCardClick(Tabel.id)}
                ondelete={() => handleDeleteCard(Tabel.id)}
              />
            </div>
          );
        })}
      </div> */}
      <div className="cards">
        {Tabels && Tabels.length > 0 ? (
          Tabels.map((Tabel) => {
            const statusColor = Tabel.status === "vacant" ? "green" : "red";
            return (
              <div key={Tabel.id} style={{ position: "relative" }}>
                <TabeCard
                  number={Tabel.table_number}
                  status={Tabel.status}
                  color={statusColor}
                  onClick={() => handleCardClick(Tabel.id)}
                  ondelete={() => handleDeleteCard(Tabel.id)}
                  onQRClick={() => handleQRClick(Tabel)}
                  showDelete={isManager}
                />
              </div>
            );
          })
        ) : (
          <p>ما في أي طاولات حالياً</p>
        )}
      </div>

      {showPopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Confirm Status Change</h3>
            <p>Are you sure you want to change the status of this table?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmChange} className="confirm-btn">
                Yes
              </button>
              <button onClick={handleCancelChange} className="cancel-btn">
                No
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeletePopup && (
        <div className="popup-overlay">
          <div className="popup-box">
            <h3>Confirm Delete</h3>
            <p>Are you sure you want to delete this table?</p>
            <div className="popup-actions">
              <button onClick={handleConfirmDelete} className="confirm-btn">
                Yes, Delete
              </button>
              <button onClick={handleCancelDelete} className="cancel-btn">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {showQRPopup && selectedTableForQR && (
        <div className="qr-modal-overlay">
          <div className="qr-modal">
            <div className="qr-modal-header">
              <h3>Table {selectedTableForQR.table_number} QR Code</h3>
              <button className="close-button" onClick={handleCloseQR}>
                &times;
              </button>
            </div>
            <div className="qr-code-container">
              <img
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`http://localhost:3000/${selectedTableForQR.id}`)}`}
                alt={`QR Code for Table ${selectedTableForQR.table_number}`}
              />
            </div>
            <div className="qr-modal-actions">
              <button className="print-button" onClick={handlePrintQR}>
                <i className="fas fa-print"></i> Print
              </button>
              <button className="close-button" onClick={handleCloseQR}>
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <style>{`
        .popup-overlay {
          position: fixed;
          top: 0;
          left: 0;
          width: 100%;
          height: 100%;
          background: rgba(0,0,0,0.5);
          display: flex;
          justify-content: center;
          align-items: center;
          z-index: 999;
        }
        .popup-box {
          background: #454242;
          padding: 20px 30px;
          border-radius: 10px;
          text-align: center;
          box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
        }
          .popup-actions{
          display: flex;
          justify-content: center;
          align-items: center;
          }
        .popup-actions button {
          margin: 0 10px;
          padding: 8px 16px;
          border-radius: 5px;
          border: none;
          cursor: pointer;
        }
        .confirm-btn {
          background-color: #28a745;
          color: white;
        }
        .cancel-btn {
          background-color: #dc3545;
          color: white;
        }
        .qr-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.7);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          backdrop-filter: blur(5px);
        }
        .qr-modal {
          background: #1f2937;
          border-radius: 12px;
          padding: 20px;
          width: 90%;
          max-width: 320px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
          border: 1px solid #374151;
          animation: modalFadeIn 0.3s ease-out;
        }
        @keyframes modalFadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .qr-modal-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 15px;
          padding-bottom: 10px;
          border-bottom: 1px solid #374151;
        }
        .qr-modal-header h3 {
          margin: 0;
          color: #f9fafb;
          font-size: 1.2rem;
        }
        .close-button {
          background: none;
          border: none;
          color: #9ca3af;
          font-size: 1.5rem;
          cursor: pointer;
          padding: 0 5px;
          line-height: 1;
          transition: color 0.2s;
        }
        .close-button:hover {
          color: #f59e0b;
        }
        .qr-code-container {
          background: white;
          padding: 15px;
          border-radius: 8px;
          margin-bottom: 15px;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .qr-code-container img {
          max-width: 100%;
          height: auto;
          display: block;
        }
        .qr-modal-actions {
          display: flex;
          gap: 10px;
          justify-content: flex-end;
        }
        .print-button,
        .close-button {
          padding: 8px 16px;
          border-radius: 6px;
          font-weight: 600;
          font-size: 0.9rem;
          cursor: pointer;
          transition: all 0.2s;
          display: flex;
          align-items: center;
          gap: 6px;
        }
        .print-button {
          background: linear-gradient(135deg, #f59e0b, #d97706);
          color: #111827;
          border: none;
        }
        .print-button:hover {
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        }
        .close-button {
          background: #374151;
          color: #f9fafb;
          border: 1px solid #4b5563;
        }
        .close-button:hover {
          background: #4b5563;
        }
      `}</style>
    </div>
  );
}
