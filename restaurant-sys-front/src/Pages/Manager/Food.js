import { useEffect, useState } from "react";
import FoodCard from "../../Component/FoodCard";
import Cookies from "js-cookie";
import axios from "axios";
import { motion } from "framer-motion";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";

export default function Food() {
  const [foods, setFoods] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeCategory, setActiveCategory] = useState("All");

  // مودال التعديل
  const [selectedFood, setSelectedFood] = useState(null);
  const [formData, setFormData] = useState({
    price: "",
    discount: "",
    time: "",
    discription: "",
    image: null,
  });

  // مودال الحذف
  const [foodToDelete, setFoodToDelete] = useState(null);

  const token = Cookies.get("authToken");
  const navigate = useNavigate();

  useEffect(() => {
    fetchFoods();
    fetchCategories();
  }, []);

  const fetchFoods = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/Employee/getFoodInRestaurant",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (res.data.food) {
        const ts = Date.now();
        const foodsWithCacheBust = res.data.food.map((f) => ({
          ...f,
          image_url: f.image_url ? `${f.image_url}?t=${ts}` : f.image_url,
          image: f.image ? `${f.image}?t=${ts}` : f.image,
        }));
        setFoods(foodsWithCacheBust);
      }
    } catch (err) {
      console.error("Error fetching foods:", err);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await axios.get(
        "http://127.0.0.1:8000/api/Manager/GetCategories",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setCategories(res.data);
    } catch (err) {
      console.error("Error fetching categories:", err);
    }
  };

  // فلترة الأطعمة
  const filteredFoods =
    activeCategory === "All"
      ? foods
      : foods.filter((f) => f.category_name === activeCategory);

  // فتح مودال التعديل
  const handleOpenEdit = (food) => {
    setSelectedFood(food);
    setFormData({
      price: food.price,
      discount: food.discount,
      time: food["time-to-make"],
      discription: food.discription,
      image: null,
    });
  };
  const handleCloseModal = () => setSelectedFood(null);

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      setFormData({ ...formData, image: files[0] });
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleUpdate = async () => {
    try {
      const formDataToSend = new FormData();
      formDataToSend.append("price", formData.price);
      formDataToSend.append("discription", formData.discription);
      // Send null when discount is empty to satisfy nullable rule
      if (formData.discount === "" || formData.discount === null) {
        formDataToSend.append("discount", "");
      } else {
        formDataToSend.append("discount", formData.discount);
      }
      // Normalize time to HH:MM:SS as required by backend regex
      let normalizedTime = formData.time || "";
      if (/^\d{2}:\d{2}$/.test(normalizedTime)) {
        normalizedTime = `${normalizedTime}:00`;
      }
      formDataToSend.append("time-to-make", normalizedTime);
      if (formData.image) {
        formDataToSend.append("image", formData.image);
      }

      await axios.post(
        `http://127.0.0.1:8000/api/UpdateFood/${selectedFood.id}`,
        formDataToSend,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            // Let axios set the multipart boundary automatically
          },
        }
      );

      toast.success("✅ Food updated successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Refetch list without full page reload
      await fetchFoods();
      setSelectedFood(null);
    } catch (error) {
      if (error?.response?.status === 422 && error.response.data?.errors) {
        const errors = error.response.data.errors;
        const firstField = Object.keys(errors)[0];
        const firstMessage = Array.isArray(errors[firstField])
          ? errors[firstField][0]
          : String(errors[firstField]);
        toast.error(firstMessage || "Validation error (422)");
        console.error("Validation errors:", errors);
      } else if (error?.response?.data?.message) {
        toast.error(error.response.data.message);
      } else {
        toast.error("❌ Failed to update food");
      }
      console.error("Error updating food:", error);
    }
  };

  // فتح مودال الحذف
  const handleOpenDelete = (food) => setFoodToDelete(food);
  const handleCloseDelete = () => setFoodToDelete(null);

  const handleDelete = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/deleteFood/${foodToDelete.id}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      toast.success("🗑 Food deleted successfully!", {
        position: "top-center",
        autoClose: 2000,
      });

      // Update local state without full page reload
      await fetchFoods();
      setFoodToDelete(null);
    } catch (error) {
      console.error("Error deleting food:", error);
      toast.error("❌ Failed to delete food");
    }
  };

  return (
    <div className="p-6" style={{ paddingLeft: "20px" ,width:"100vw",paddingRight:"10px"}}>
      <ToastContainer />
    <div className="" style={{ display:'flex',alignItems:'center',justifyContent:'space-between' }}>
      
      <h1 style={{ color: "orange", marginBottom: "15px", fontSize: "28px" }}>
        <i className="fas fa-utensils" style={{ marginRight: "10px" }}></i>
        Restaurant Menu
      </h1>
      {/* زر إضافة الطعام */}
      <button
        onClick={() => navigate("/add-food")}
        style={{
          backgroundColor: "#ff9800",
          color: "#fff",
          border: "none",
          padding: "10px 18px",
          borderRadius: "8px",
          cursor: "pointer",
          fontWeight: "bold",
          transition: "0.3s",
        }}
        onMouseOver={(e) => (e.target.style.backgroundColor = "#e68900")}
        onMouseOut={(e) => (e.target.style.backgroundColor = "#ff9800")}
      >
        + Add Food
      </button>
    </div>
      {/* أزرار التصنيفات */}
      <div
        style={{
          marginBottom: "30px",
          display: "flex",
          gap: "10px",
          flexWrap: "wrap",
        }}
      >
        <button
          onClick={() => setActiveCategory("All")}
          className={`category-btn ${activeCategory === "All" ? "active" : ""}`}
        >
          All
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.category.name)}
            className={`category-btn ${
              activeCategory === cat.category.name ? "active" : ""
            }`}
          >
            {cat.category.name}
          </button>
        ))}
      </div>

      {/* عرض الأطعمة */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))",
          gap: "25px",
        }}
      >
        {filteredFoods.map((food, index) => (
          <motion.div
            key={food.id}
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
              delay: index * 0.1,
              duration: 0.4,
              type: "spring",
            }}
          >
            <FoodCard
              food={food}
              onEdit={() => handleOpenEdit(food)}
              onDelete={() => handleOpenDelete(food)}
            />
          </motion.div>
        ))}
      </div>

      {/* مودال التعديل */}
      {selectedFood && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Edit Food</h2>
            <div className="modal-body">
              <label>
                Price
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                />
              </label>
              <label>
                Description
                <textarea
                  name="discription"
                  value={formData.discription}
                  onChange={handleChange}
                  rows={3}
                  className="form-input"
                />
              </label>
              <label>
                Discount
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="1"
                  name="discount"
                  value={formData.discount}
                  onChange={handleChange}
                />
              </label>
              <label>
                Time to make
                <input
                  type="time"
                  name="time"
                  value={formData.time}
                  onChange={handleChange}
                  step="1"
                  lang="en-GB"
                />
              </label>
              <label>
                Image
                <input type="file" name="image" onChange={handleChange} />
              </label>
            </div>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseModal}>
                Cancel
              </button>
              <button className="edit-btn" onClick={handleUpdate}>
                Update
              </button>
            </div>
          </div>
        </div>
      )}

      {/* مودال الحذف */}
      {foodToDelete && (
        <div className="modal-overlay" onClick={handleCloseDelete}>
          <div className="modal" onClick={(e) => e.stopPropagation()}>
            <h2 className="modal-title">Confirm Delete</h2>
            <p style={{ textAlign: "center" }}>
              Are you sure you want to delete{" "}
              <span style={{ color: "orange" }}>{foodToDelete.name}</span>?
            </p>
            <div className="modal-actions">
              <button className="cancel-btn" onClick={handleCloseDelete}>
                Cancel
              </button>
              <button className="delete-btn" onClick={handleDelete}>
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
