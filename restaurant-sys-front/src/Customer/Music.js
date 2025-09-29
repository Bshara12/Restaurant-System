import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import "./Customer.css";

export default function Music() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [musics, setMusics] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState("مطعم الذواقة");
  const [showAddMusic, setShowAddMusic] = useState(false);
  const [newMusicName, setNewMusicName] = useState("");

  useEffect(() => {
    fetchMusics();
    // Get restaurant name from localStorage
    const storedRestaurantName = localStorage.getItem('restaurantName');
    if (storedRestaurantName) {
      setRestaurantName(storedRestaurantName);
    }
  }, []);

  const fetchMusics = async () => {
    try {
      setLoading(true);
      // Get restaurant ID from cookies
      const restaurantId = Cookies.get('restaurantId') || '1';
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/GetallMusicForCustomer/${restaurantId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Music API Response:", data);
        setMusics(data.musics || []);
        if (data.restaurant_name) {
          setRestaurantName(data.restaurant_name);
        }
      } else {
        toast.error("فشل في جلب الأغاني");
      }
    } catch (error) {
      console.error("Error fetching musics:", error);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const handleAddMusic = async () => {
    if (!newMusicName.trim()) {
      toast.error("يرجى إدخال اسم الأغنية");
      return;
    }

    try {
      const customerId = Cookies.get('customerId');
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/createMusicAsCustomer/${customerId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: newMusicName.trim()
        }),
      });

      if (response.ok) {
        toast.success("تم إضافة الأغنية بنجاح!");
        setNewMusicName("");
        setShowAddMusic(false);
        // Refresh the list to show the new music
        fetchMusics();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "فشل في إضافة الأغنية");
      }
    } catch (error) {
      console.error("Error adding music:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const goBackToMenu = () => {
    navigate(`/${customerId}`);
  };

  return (
    <div className="music-page">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={true}
        pauseOnFocusLoss
        pauseOnHover
      />

      <div className="music-header">
        <div className="music-header-content">
          <div className="music-logo-section">
            <img
              src={require("../Assets/logores2.png")}
              alt="Restaurant Logo"
              className="music-logo"
            />
            <div className="music-title-section">
              <button className="back-to-menu-btn" onClick={goBackToMenu}>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              <h1>
                <i className="fa-solid fa-music"></i>
                {restaurantName} - قائمة الأغاني
              </h1>
            </div>
          </div>
          <div className="music-info">
            <span className="music-customer-id">العميل: {Cookies.get('customerId')}</span>
          </div>
        </div>
      </div>

      <div className="music-content">
        <div className="music-actions">
          <button 
            className="add-music-btn" 
            onClick={() => setShowAddMusic(true)}
          >
            <i className="fa-solid fa-plus"></i>
            طلب إضافة أغنية
          </button>
        </div>

        {loading ? (
          <div className="music-loading">
            <div className="music-spinner"></div>
            <p>جاري تحميل الأغاني...</p>
          </div>
        ) : musics.length > 0 ? (
          <div className="music-list">
            <div className="music-section-title">
              <i className="fa-solid fa-headphones"></i>
              <h2>الأغاني المتاحة</h2>
            </div>
            <div className="music-grid">
              {musics.map((music, index) => (
                <div 
                  key={music.id} 
                  className={`music-card ${index === 0 ? 'now-playing' : ''}`}
                >
                  <div className="music-icon">
                    {index === 0 ? (
                      <div className="playing-animation">
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                        <div className="wave"></div>
                      </div>
                    ) : (
                      <i className="fa-solid fa-music"></i>
                    )}
                  </div>
                  <div className="music-details">
                    <h3 className="music-name">{music.name}</h3>
                    {index === 0 && (
                      <div className="now-playing-label">
                        <i className="fa-solid fa-play"></i>
                        قيد التشغيل الآن
                      </div>
                    )}
                    <div className="music-meta">
                      <span className="music-date">
                        <i className="fa-solid fa-calendar"></i>
                        {new Date(music.created_at).toLocaleDateString('ar-EG')}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="music-empty">
            <div className="empty-icon">
              <i className="fa-solid fa-music"></i>
            </div>
            <h3>لا توجد أغاني متاحة</h3>
            <p>لم يتم إضافة أي أغاني بعد</p>
            <button className="start-music-btn" onClick={() => setShowAddMusic(true)}>
              <i className="fa-solid fa-plus"></i>
              اطلب أغنية الآن
            </button>
          </div>
        )}
      </div>

      {/* Add Music Modal */}
      {showAddMusic && (
        <div className="add-music-modal-overlay">
          <div className="add-music-modal">
            <div className="add-music-header">
              <h3>
                <i className="fa-solid fa-plus"></i>
                طلب إضافة أغنية
              </h3>
              <button 
                className="close-modal-btn" 
                onClick={() => setShowAddMusic(false)}
              >
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            <div className="add-music-body">
              <div className="form-group">
                <label htmlFor="musicName">اسم الأغنية:</label>
                <input
                  type="text"
                  id="musicName"
                  value={newMusicName}
                  onChange={(e) => setNewMusicName(e.target.value)}
                  placeholder="أدخل اسم الأغنية..."
                  className="music-input"
                />
              </div>
            </div>
            <div className="add-music-footer">
              <button 
                className="cancel-btn" 
                onClick={() => setShowAddMusic(false)}
              >
                إلغاء
              </button>
              <button 
                className="submit-btn" 
                onClick={handleAddMusic}
              >
                <i className="fa-solid fa-paper-plane"></i>
                إرسال الطلب
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
