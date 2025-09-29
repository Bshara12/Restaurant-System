import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import "./Customer.css";

export default function Orders() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [restaurantName, setRestaurantName] = useState("مطعم الذواقة");

  useEffect(() => {
    fetchOrders();
    // Get restaurant name from cookies or storage if available
    const storedRestaurantName = localStorage.getItem('restaurantName');
    if (storedRestaurantName) {
      setRestaurantName(storedRestaurantName);
    }
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const customerId = Cookies.get('customerId');
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/getCustomerOrders/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Orders API Response:", data);
        console.log("First order status:", data[0]?.status);
        setOrders(Array.isArray(data) ? data : []);
      } else {
        toast.error("فشل في جلب الطلبات");
      }
    } catch (error) {
      console.error("Error fetching orders:", error);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setLoading(false);
    }
  };

  const goBackToMenu = () => {
    navigate(`/${customerId}`);
  };

  const getOrderStatusInfo = (status) => {
    console.log("Order status received:", status, "Type:", typeof status);
    switch (status) {
      case 'pending':
      case 'PENDING':
        return {
          color: '#ffd700',
          text: 'قيد الانتظار',
          icon: 'fa-clock'
        };
      case 'making':
      case 'MAKING':
        return {
          color: '#ff9800',
          text: 'يتم التحضير',
          icon: 'fa-fire'
        };
      case 'done':
      case 'DONE':
        return {
          color: '#2196f3',
          text: 'جاهز للتقديم',
          icon: 'fa-check-circle'
        };
      case 'delivered':
      case 'DELIVERED':
        return {
          color: '#4caf50',
          text: 'تم التسليم',
          icon: 'fa-check-double'
        };
      case 'cancelled':
      case 'CANCELLED':
        return {
          color: '#f44336',
          text: 'ملغي',
          icon: 'fa-times-circle'
        };
      default:
        return {
          color: '#9e9e9e',
          text: status || 'غير محدد', // عرض الحالة كما هي
          icon: 'fa-question-circle'
        };
    }
  };

  return (
    <div className="orders-page">
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

      <div className="orders-header">
        <div className="orders-header-content">
          <div className="orders-logo-section">
            <img
              src={require("../Assets/logores2.png")}
              alt="Restaurant Logo"
              className="orders-logo"
            />
            <div className="orders-title-section">
              <button className="back-to-menu-btn" onClick={goBackToMenu}>
                <i className="fa-solid fa-arrow-right"></i>
              </button>
              <h1>
                <i className="fa-solid fa-clipboard-list"></i>
                {restaurantName} - طلباتي
              </h1>
            </div>
          </div>
          <div className="orders-info">
            <span className="orders-customer-id">العميل: {Cookies.get('customerId')}</span>
          </div>
        </div>
      </div>

      <div className="orders-content">
        {loading ? (
          <div className="orders-loading">
            <div className="orders-spinner"></div>
            <p>جاري تحميل الطلبات...</p>
          </div>
        ) : orders.length > 0 ? (
          <div className="orders-list">
            {orders.map((order, orderIndex) => (
              <div key={order.order_id || orderIndex} className="order-card">
                <div className="order-header">
                  <div className="order-info">
                    <h3 className="order-title">
                      <i className="fa-solid fa-receipt"></i>
                      طلبية رقم #{order.order_id}
                    </h3>
                    <div className="order-details">
                      <span className="order-table">
                        <i className="fa-solid fa-chair"></i>
                        طاولة رقم {order.table_id}
                      </span>
                      <span className="order-items-count">
                        <i className="fa-solid fa-utensils"></i>
                        {order.items?.length || 0} عنصر
                      </span>
                    </div>
                  </div>
                  <div 
                    className="order-status-badge"
                    style={{ backgroundColor: getOrderStatusInfo(order.status).color }}
                  >
                    <i className={`fa-solid ${getOrderStatusInfo(order.status).icon}`}></i>
                    {getOrderStatusInfo(order.status).text}
                  </div>
                </div>

                <div className="order-items">
                  <h4 className="items-title">
                    <i className="fa-solid fa-list"></i>
                    تفاصيل الطلبية
                  </h4>
                  <div className="items-grid">
                    {order.items?.map((item, itemIndex) => (
                      <div key={itemIndex} className="order-item">
                        <div className="item-icon">
                          <i className="fa-solid fa-bowl-food"></i>
                        </div>
                        <div className="item-details">
                          <h5 className="item-name">{item.food_name}</h5>
                          <div className="item-info">
                            <span className="item-quantity">
                              <i className="fa-solid fa-hashtag"></i>
                              الكمية: {item.quantity}
                            </span>
                            {item.description && item.description !== 'no edit' && item.description.trim() !== '' && (
                              <span className="item-description">
                                <i className="fa-solid fa-comment"></i>
                                ملاحظة: {item.description}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            ))}
          </div>
        ) : (
          <div className="orders-empty">
            <div className="empty-icon">
              <i className="fa-solid fa-clipboard-list"></i>
            </div>
            <h3>لا توجد طلبات بعد</h3>
            <p>لم تقم بتقديم أي طلبات حتى الآن</p>
            <button className="start-ordering-btn" onClick={goBackToMenu}>
              <i className="fa-solid fa-utensils"></i>
              ابدأ الطلب الآن
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
