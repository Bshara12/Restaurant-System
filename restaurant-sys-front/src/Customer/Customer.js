import { useParams, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import "./Customer.css";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";

export default function Customer() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [tokenData, setTokenData] = useState(null);
  const [error, setError] = useState(null);
  const [restaurantName, setRestaurantName] = useState("مطعم الذواقة");
  const [foods, setFoods] = useState([]);
  const [filteredFoods, setFilteredFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState("الكل");
  const [discountedFoods, setDiscountedFoods] = useState([]);
  const [realCustomerId, setRealCustomerId] = useState(null);
  const [cartItems, setCartItems] = useState([]);
  const [cartCount, setCartCount] = useState(0);
  const [showPurchasePopup, setShowPurchasePopup] = useState(false);
  const [selectedFood, setSelectedFood] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [description, setDescription] = useState("");
  const [showServices, setShowServices] = useState(false);
  const [showOffersOnly, setShowOffersOnly] = useState(false);

  useEffect(() => {
    const initializeCustomer = async () => {
      try {
        setLoading(true);

        // Generate token
        const tokenResponse = await fetch(`http://127.0.0.1:8000/api/generateToken/${id}`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (tokenResponse.ok) {
          const tokenData = await tokenResponse.json();
          setTokenData(tokenData);

          // Store restaurant name if available
          if (tokenData.data && tokenData.data.restaurant_name) {
            setRestaurantName(tokenData.data.restaurant_name);
            localStorage.setItem('restaurantName', tokenData.data.restaurant_name);
          }

          // Store in cookies
          Cookies.set('customerToken', tokenData.token || tokenData.data?.customer?.token || id);
          Cookies.set('customerId', tokenData.data?.customer?.id || id);
          Cookies.set('tableId', tokenData.table_id || tokenData.data?.customer?.table_id || '1');
          Cookies.set('restaurantId', tokenData.data?.restaurant || '1');

          // Set real customer ID for display
          setRealCustomerId(tokenData.data?.customer?.id || id);

          toast.success("تم إنشاء الرمز المميز بنجاح!");

          // Fetch foods and cart count using correct IDs
          const realCustomerId = tokenData.data?.customer?.id || id;
          await fetchFoods(); // Uses restaurant ID from cookies
          await fetchCartCount(realCustomerId);
        } else {
          const errorData = await tokenResponse.json();
          setError(errorData.message || "فشل في إنشاء الرمز المميز");
          toast.error("فشل في إنشاء الرمز المميز");
        }
      } catch (error) {
        setError("خطأ في الاتصال بالخادم");
        toast.error("خطأ في الاتصال بالخادم");
        console.error("Error:", error);
      } finally {
        setLoading(false);
      }
    };

    const fetchFoods = async (restaurantId) => {
      try {
        // Get restaurant ID from cookies
        const restaurantId = Cookies.get('restaurantId') || '1';
        const response = await fetch(`http://127.0.0.1:8000/api/Customer/getFoodByRestaurantId/${restaurantId}`);
        if (response.ok) {
          const data = await response.json();
          setFoods(data.food);
          setFilteredFoods(data.food);

          // Extract unique categories
          const uniqueCategories = [...new Set(data.food.map(food => food.category_name))];
          setCategories(uniqueCategories);

          // Get discounted foods (discount !== 1 and discount > 0)
          const discounted = data.food.filter(food => 
            food.discount && 
            food.discount !== 1 && 
            food.discount > 0 && 
            food.discount < 1
          );
          setDiscountedFoods(discounted);
          console.log("Discounted foods found:", discounted.length); // Debug log
        } else {
          toast.error("فشل في جلب الأطعمة");
        }
      } catch (error) {
        console.error("Error fetching foods:", error);
        toast.error("خطأ في جلب الأطعمة");
      }
    };


    if (id) {
      initializeCustomer();
    }
  }, [id]);

  // Update cart count periodically
  useEffect(() => {
    if (id) {
      // Update cart count every 30 seconds
      const interval = setInterval(() => {
        fetchCartCount(id);
      }, 30000);

      return () => clearInterval(interval);
    }
  }, [id]);

  const fetchCartCount = async (customerId) => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/getlist/${customerId}`);
      if (response.ok) {
        const data = await response.json();
        console.log("Cart Count API Response:", data);
        
        // Count total items in all lists
        let totalItems = 0;
        if (data.lists && typeof data.lists === 'object') {
          Object.values(data.lists).forEach(list => {
            if (list.items && Array.isArray(list.items)) {
              totalItems += list.items.length;
            }
          });
        }
        
        setCartCount(totalItems);
        console.log("Total cart items:", totalItems);
      }
    } catch (error) {
      console.error("Error fetching cart count:", error);
    }
  };

  const handleCategoryFilter = (category) => {
    setSelectedCategory(category);
    let filtered = foods;

    // Apply category filter
    if (category !== "all") {
      filtered = filtered.filter(food => food.category_name === category);
    }

    // Apply offers filter
    if (showOffersOnly) {
      filtered = filtered.filter(food => food.discount !== 1);
    }

    setFilteredFoods(filtered);
  };

  const handleOffersFilter = () => {
    setShowOffersOnly(!showOffersOnly);
    let filtered = foods;

    // Apply category filter first
    if (selectedCategory !== "all") {
      filtered = filtered.filter(food => food.category_name === selectedCategory);
    }

    // Apply offers filter
    if (!showOffersOnly) {
      filtered = filtered.filter(food => food.discount !== 1);
    }

    setFilteredFoods(filtered);
  };

  const openPurchasePopup = (food) => {
    setSelectedFood(food);
    setQuantity(1);
    setDescription("");
    setShowPurchasePopup(true);
  };

  const closePurchasePopup = () => {
    setShowPurchasePopup(false);
    setSelectedFood(null);
    setQuantity(1);
    setDescription("");
  };

  const handlePurchase = async () => {
    if (!selectedFood || quantity < 1) {
      toast.error("يرجى إدخال كمية صحيحة");
      return;
    }

    try {
      const response = await fetch("http://127.0.0.1:8000/api/Customer/Addtolist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          customer_id: realCustomerId || Cookies.get('customerId') || id,
          food_id: selectedFood.id,
          quantity: quantity,
          description: description
        }),
      });

      if (response.ok) {
        toast.success(`تمت إضافة ${selectedFood.name} إلى الطلب بنجاح!`);
        // Refresh cart count from API
        await fetchCartCount(realCustomerId || Cookies.get('customerId') || id);
        closePurchasePopup();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "فشل في إضافة الطلب");
      }
    } catch (error) {
      console.error("Error adding to order:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  // Service functions
  const handleMusicRequest = () => {
    navigate(`/${id}/music`);
  };

  const handleCarService = () => {
    navigate(`/${id}/parking`);
  };

  const handleWaiterCall = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/callwaiter/${realCustomerId || Cookies.get('customerId') || id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Please come"
        }),
      });

      if (response.ok) {
        toast.success("تم استدعاء النادل بنجاح! سيأتي قريباً");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "فشل في استدعاء النادل");
      }
    } catch (error) {
      console.error("Error calling waiter:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  const handleBillRequest = async () => {
    try {
      const response = await fetch(`http://127.0.0.1:8000/api/Customer/callwaiter/${realCustomerId || Cookies.get('customerId') || id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: "Please give me the bill"
        }),
      });

      if (response.ok) {
        toast.success("تم طلب الفاتورة بنجاح! سيأتي النادل قريباً");
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || "فشل في طلب الفاتورة");
      }
    } catch (error) {
      console.error("Error requesting bill:", error);
      toast.error("خطأ في الاتصال بالخادم");
    }
  };

  // Cart functions
  const openCart = () => {
    navigate(`/${id}/cart`);
  };

  return (
    <div className="customer-dashboard">
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

      {/* Header */}
      <header className="customer-header">
        <div className="customer-header-content">
          <div className="customer-logo-section">
            <img
              src={require("../Assets/logores2.png")}
              alt="Restaurant Logo"
              className="customer-logo"
            />
            <h1>{restaurantName} - قائمة الأطعمة</h1>
          </div>
          <div className="customer-info">
            <span className="customer-id">العميل: {Cookies.get('customerId')}</span>
            <div className="customer-actions-container">
              <button className="customer-orders-button" onClick={() => navigate(`/${id}/orders`)}>
                <i className="fa-solid fa-clipboard-list"></i>
                <span className="customer-orders-label">طلباتي</span>
              </button>
              <button className="customer-cart-button" onClick={openCart}>
                <i className="fa-solid fa-shopping-cart"></i>
                <span className="customer-cart-count">{cartCount}</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="customer-main">
        <div className="customer-dashboard-container">
          {/* Modern Offers Section - Only show if there are discounted foods */}
          {discountedFoods && discountedFoods.length > 0 && (
            <section className="customer-discount-slider-section">
              <div className="customer-offers-header">
                <h3>🔥 عروض حصرية اليوم 🔥</h3>
                <p className="customer-offers-subtitle">لا تفوت هذه الفرصة الذهبية!</p>
              </div>
              <div className="customer-offers-container">
                <div className="customer-offers-track">
                  {/* Create enough copies to fill the screen and ensure seamless loop */}
                  {Array.from({ length: 4 }, (_, setIndex) => 
                    discountedFoods.map((food, index) => (
                      <div key={`set-${setIndex}-${food.id}`} className="customer-offer-card" onClick={() => openPurchasePopup(food)}>
                        <div className="customer-offer-image">
                          <img src={food.image} alt={food.name} />
                          <div className="customer-offer-badge">
                            -{Math.round((1 - food.discount) * 100)}%
                          </div>
                        </div>
                        <div className="customer-offer-content">
                          <h4 className="customer-offer-title">{food.name}</h4>
                          <div className="customer-offer-prices">
                            <span className="customer-original-price">{food.price}₪</span>
                            <span className="customer-discounted-price">
                              {Math.round(food.price * food.discount)}₪
                            </span>
                          </div>
                          <button className="customer-offer-cta">
                            اطلب الآن
                          </button>
                        </div>
                      </div>
                    ))
                  ).flat()}
                </div>
              </div>
            </section>
          )}

          {/* Services Section */}
          <section className="customer-services-section">
            <div className="customer-section-header">
              <h3>
                <i className="fa-solid fa-concierge-bell"></i>
                خدماتنا
              </h3>
            </div>
            <div className="customer-services-grid">
              <div className="customer-service-card" onClick={handleMusicRequest}>
                <div className="customer-service-icon">
                  <i className="fa-solid fa-music"></i>
                </div>
                <h4>طلب أغنية</h4>
                <p>اطلب أغانيك المفضلة من الـ DJ</p>
                <button className="customer-service-btn">
                  <i className="fa-solid fa-headphones"></i>
                  اطلب الآن
                </button>
              </div>

              <div className="customer-service-card" onClick={handleCarService}>
                <div className="customer-service-icon">
                  <i className="fa-solid fa-car"></i>
                </div>
                <h4>خدمة المركبات</h4>
                <p>خدمة إحضار وإرجاع المركبات</p>
                <button className="customer-service-btn">
                  <i className="fa-solid fa-key"></i>
                  اطلب الخدمة
                </button>
              </div>

              <div className="customer-service-card" onClick={handleWaiterCall}>
                <div className="customer-service-icon">
                  <i className="fa-solid fa-user-tie"></i>
                </div>
                <h4>استدعاء نادل</h4>
                <p>استدعاء النادل للمساعدة</p>
                <button className="customer-service-btn">
                  <i className="fa-solid fa-bell"></i>
                  استدعاء
                </button>
              </div>

              <div className="customer-service-card" onClick={handleBillRequest}>
                <div className="customer-service-icon">
                  <i className="fa-solid fa-receipt"></i>
                </div>
                <h4>طلب الفاتورة</h4>
                <p>طلب فاتورة الطلب الحالي</p>
                <button className="customer-service-btn">
                  <i className="fa-solid fa-file-invoice"></i>
                  اطلب الفاتورة
                </button>
              </div>
            </div>
          </section>

          {/* Category Filters */}
          <section className="category-filters-section">
            <div className="customer-section-header">
              <h3>
                <i className="fa-solid fa-filter"></i>
                تصنيفات الأطعمة
              </h3>
            </div>
            <div className="customer-category-buttons">
              <button
                className={`customer-category-btn ${selectedCategory === "all" ? "active" : ""}`}
                onClick={() => handleCategoryFilter("all")}
              >
                الكل
              </button>
              {categories.map((category, index) => (
                <button
                  key={index}
                  className={`customer-category-btn ${selectedCategory === category ? "active" : ""}`}
                  onClick={() => handleCategoryFilter(category)}
                >
                  {category}
                </button>
              ))}
              <button
                className={`customer-offers-btn ${showOffersOnly ? "active" : ""}`}
                onClick={handleOffersFilter}
              >
                <i className="fa-solid fa-percentage"></i>
                العروض فقط
              </button>
            </div>
          </section>

          {/* Food Gallery */}
          <section className="food-gallery-section">
            <div className="customer-section-header">
              <h3>
                <i className="fa-solid fa-utensils"></i>
                قائمة الأطعمة
              </h3>
            </div>

            {loading ? (
              <div className="customer-loading-spinner">
                <div className="customer-spinner"></div>
                <p>جاري تحميل الأطعمة...</p>
              </div>
            ) : error ? (
              <div className="customer-error-message">
                <i className="fa-solid fa-exclamation-triangle"></i>
                <p>{error}</p>
                <button
                  onClick={() => window.location.reload()}
                  className="customer-retry-button"
                >
                  إعادة المحاولة
                </button>
              </div>
            ) : (
              <div className="food-grid">
                {filteredFoods.map((food) => (
                  <div key={food.id} className="food-card">
                    <div className="food-image-container">
                      <img src={food.image} alt={food.name} className="food-image" />
                      {food.discount !== 1 && (
                        <div className="food-discount-badge">
                          {Math.round((1 - food.discount) * 100)}%
                        </div>
                      )}
                    </div>
                    <div className="food-info">
                      <h4 className="food-name">{food.name}</h4>
                      <p className="food-description">{food.discription}</p>
                      <div className="food-details">
                        <div className="food-category">
                          <i className="fa-solid fa-tag"></i>
                          {food.category_name}
                        </div>
                        <div className="food-time">
                          <i className="fa-solid fa-clock"></i>
                          {food["time-to-make"]}
                        </div>
                      </div>
                      <div className="food-price-section">
                        {food.discount !== 1 ? (
                          <div className="price-with-discount">
                            <span className="original-price">{food.price}₪</span>
                            <span className="discounted-price">
                              {Math.round(food.price * food.discount)}₪
                            </span>
                          </div>
                        ) : (
                          <span className="regular-price">{food.price}₪</span>
                        )}
                        <button className="customer-order-btn" onClick={() => openPurchasePopup(food)}>
                          <i className="fa-solid fa-cart-plus"></i>
                          اطلب الآن
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="customer-footer">
        <p>&copy; 2024 {restaurantName}. جميع الحقوق محفوظة</p>
      </footer>

      {/* Purchase Popup */}
      {showPurchasePopup && (
        <div className="purchase-popup-overlay">
          <div className="purchase-popup">
            <div className="purchase-popup-header">
              <h3>إضافة إلى الطلب</h3>
              <button className="close-popup-btn" onClick={closePurchasePopup}>
                <i className="fa-solid fa-times"></i>
              </button>
            </div>
            
            {selectedFood && (
              <div className="purchase-popup-content">
                <div className="selected-food-info">
                  <img src={selectedFood.image} alt={selectedFood.name} />
                  <div className="food-details">
                    <h4>{selectedFood.name}</h4>
                    <p className="food-price">
                      {selectedFood.discount !== 1 ? (
                        <>
                          <span className="original-price">{selectedFood.price}₪</span>
                          <span className="discounted-price">
                            {Math.round(selectedFood.price * selectedFood.discount)}₪
                          </span>
                        </>
                      ) : (
                        <span className="regular-price">{selectedFood.price}₪</span>
                      )}
                    </p>
                  </div>
                </div>

                <div className="purchase-form">
                  <div className="form-group">
                    <label htmlFor="quantity">الكمية:</label>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                      className="quantity-input"
                    />
                  </div>

                  <div className="form-group">
                    <label htmlFor="description">الوصف (اختياري):</label>
                    <textarea
                      id="description"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="أضف ملاحظات خاصة للطلب..."
                      className="description-input"
                      rows="3"
                    />
                  </div>
                </div>

                <div className="purchase-popup-actions">
                  <button className="cancel-btn" onClick={closePurchasePopup}>
                    إلغاء
                  </button>
                  <button className="confirm-btn" onClick={handlePurchase}>
                    <i className="fa-solid fa-check"></i>
                    تأكيد الطلب
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}
