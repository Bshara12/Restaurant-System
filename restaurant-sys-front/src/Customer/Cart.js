import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import "./Customer.css";

export default function Cart() {
  const { customerId } = useParams();
  const navigate = useNavigate();
  const [cartData, setCartData] = useState(null);
  const [cartLoading, setCartLoading] = useState(false);

  useEffect(() => {
    fetchCartData();
  }, []);

  const fetchCartData = async () => {
    try {
      setCartLoading(true);
      const customerId = Cookies.get('customerId');
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/getlist/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Cart API Response:", data); // Debug log
        setCartData(data);
      } else {
        toast.error("فشل في جلب بيانات السلة");
      }
    } catch (error) {
      console.error("Error fetching cart data:", error);
      toast.error("خطأ في الاتصال بالخادم");
    } finally {
      setCartLoading(false);
    }
  };

  const handleDeleteItem = async (foodId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/deletefoodfromlist/${foodId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("تم حذف العنصر بنجاح!");
        // Refresh cart data
        fetchCartData();
      } else {
        toast.error("فشل في حذف العنصر");
      }
    } catch (error) {
      console.error("Error deleting item:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleOrderRequest = async () => {
    try {
      const customerId = Cookies.get('customerId');
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/CreateOrder/${customerId}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.ok) {
        toast.success("تم إنشاء الطلبية بنجاح!");
        // Refresh cart data
        fetchCartData();
      } else {
        toast.error("فشل في إنشاء الطلبية");
      }
    } catch (error) {
      console.error("Error creating order:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const goBackToMenu = () => {
    navigate(`/${customerId}`);
  };

  return (
    <div className="cart-standalone-page">
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
      <div className="cart-standalone-header">
        <div className="cart-standalone-header-content">
          <div className="cart-standalone-title">
            <button className="back-to-menu-btn" onClick={goBackToMenu}>
              <i className="fa-solid fa-arrow-right"></i>
            </button>
            <h1>
              <i className="fa-solid fa-shopping-cart"></i>
              طلباتي
            </h1>
          </div>
          <div className="cart-standalone-info">
            <span className="cart-customer-id">العميل: {Cookies.get('customerId')}</span>
          </div>
        </div>
      </div>

      <div className="cart-standalone-content">
        {cartLoading ? (
          <div className="cart-loading">
            <div className="cart-spinner"></div>
            <p>جاري تحميل الطلبات...</p>
          </div>
        ) : cartData && ((cartData.lists && Object.keys(cartData.lists).length > 0) || (Array.isArray(cartData) && cartData.length > 0)) ? (
          <div className="cart-lists-container">
            {cartData.lists ? (
              Object.values(cartData.lists).map((list, listIndex) => (
                <div key={list.list_id || listIndex} className="cart-list-item">
                  <div className="cart-list-header">
                    <h4>
                      <i className="fa-solid fa-list"></i>
                      قائمة رقم {list.list_id || (listIndex + 1)}
                    </h4>
                  </div>
                  
                  <div className="cart-items-grid">
                    {(list.items || []).map((item, itemIndex) => (
                      <div key={itemIndex} className="cart-item-card">
                        <div className="cart-item-image">
                          <img 
                            src={item.image?.startsWith('http') ? item.image : `http://127.0.0.1:8000/${item.image}`} 
                            alt={item.food_name || item.name} 
                            onError={(e) => {
                              e.target.src = '/placeholder-food.jpg';
                            }}
                          />
                        </div>
                        
                        <div className="cart-item-info">
                          <h5 className="cart-item-name">{item.food_name || item.name}</h5>
                          <div className="cart-item-quantity">
                            <i className="fa-solid fa-hashtag"></i>
                            الكمية: {item.quantity}
                          </div>
                          {item.description && item.description !== 'no edit' && (
                            <div className="cart-item-description">
                              <i className="fa-solid fa-comment"></i>
                              {item.description}
                            </div>
                          )}
                        </div>
                        
                        <div className="cart-item-actions">
                          <button 
                            className="delete-item-btn" 
                            onClick={() => handleDeleteItem(item.food_id)}
                            title="حذف العنصر"
                          >
                            <i className="fa-solid fa-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))
            ) : Array.isArray(cartData) ? (
              <div className="cart-list-item">
                <div className="cart-list-header">
                  <h4>
                    <i className="fa-solid fa-list"></i>
                    طلباتي
                  </h4>
                </div>
                
                <div className="cart-items-grid">
                  {cartData.map((item, itemIndex) => (
                    <div key={itemIndex} className="cart-item-card">
                      <div className="cart-item-image">
                        <img 
                          src={item.image?.startsWith('http') ? item.image : `http://127.0.0.1:8000/${item.image}`} 
                          alt={item.food_name || item.name}
                          onError={(e) => {
                            e.target.src = '/placeholder-food.jpg';
                          }}
                        />
                      </div>
                      
                      <div className="cart-item-info">
                        <h5 className="cart-item-name">{item.food_name || item.name}</h5>
                        <div className="cart-item-quantity">
                          <i className="fa-solid fa-hashtag"></i>
                          الكمية: {item.quantity}
                        </div>
                        {item.description && item.description !== 'no edit' && (
                          <div className="cart-item-description">
                            <i className="fa-solid fa-comment"></i>
                            {item.description}
                          </div>
                        )}
                      </div>
                      
                      <div className="cart-item-actions">
                        <button 
                          className="delete-item-btn" 
                          onClick={() => handleDeleteItem(item.food_id)}
                          title="حذف العنصر"
                        >
                          <i className="fa-solid fa-trash"></i>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : (
          <div className="cart-empty-state">
            <i className="fa-solid fa-shopping-cart"></i>
            <h4>لا توجد طلبات</h4>
            <p>لم تقم بإضافة أي عناصر إلى طلباتك بعد</p>
            <button className="back-to-menu-btn-large" onClick={goBackToMenu}>
              <i className="fa-solid fa-arrow-right"></i>
              العودة إلى القائمة
            </button>
          </div>
        )}
      </div>

      {cartData && ((cartData.lists && Object.keys(cartData.lists).length > 0) || (Array.isArray(cartData) && cartData.length > 0)) && (
        <div className="cart-standalone-footer">
          <button className="order-request-btn" onClick={handleOrderRequest}>
            <i className="fa-solid fa-clipboard-list"></i>
            إنشاء طلبية
          </button>
        </div>
      )}
    </div>
  );
}
