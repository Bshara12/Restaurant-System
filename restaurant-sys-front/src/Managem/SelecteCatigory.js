import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/UserSelection.css";
import HoverCard from "../Component/HoverCard";
import Cookies from "js-cookie";
import { toast } from "react-toastify"; // إضافة التوست
import "react-toastify/dist/ReactToastify.css";

const SelecteCatigory = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const authToken = Cookies.get("authToken");
  const restaurantid = Cookies.get("restaurantId");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response = await axios.get(
          "http://127.0.0.1:8000/api/Admin/GetAllCategory",
          { headers: { Authorization:` Bearer ${authToken} `} }
        );
        console.log("Fetched Users:", response.data.data);
        if (Array.isArray(response.data.data)) {
          setUsers(response.data.data);
        } else {
          setError("البيانات المستلمة ليست بتنسيق المصفوفة المتوقعة");
        }
      } catch (err) {
        console.error("Error fetching users:", err);
        setError("فشل في جلب بيانات المستخدمين");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  const handleCardClick = async (category_id) => {
    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/Manager/CreateCategoryinRes",
        {
          // restaurant_id: restaurantid,
          Category_id: category_id,
        },
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      toast.success("تم إنشاء التصنيف بنجاح");
      navigate("/Manager/dashborad/Catigory");

    } catch (error) {
      console.error("خطأ أثناء إنشاء التصنيف:", error);
      toast.error("فشل في إنشاء التصنيف");
    }
  };

  if (loading) return <p className="loading">جارٍ التحميل...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="user-selection-container">
      <h2>Select a Category</h2>
      <div className="user-list">
        {users.length > 0 ? (
          users.map((user) => (
            <HoverCard
              key={user.id}
              Name={user.name}
              onClick={() => handleCardClick(user.id)}
            />
          ))
        ) : (
          <p className="error">لا يوجد مستخدمون متاحون</p>
        )}
      </div>
    </div>
  );
};

export default SelecteCatigory;