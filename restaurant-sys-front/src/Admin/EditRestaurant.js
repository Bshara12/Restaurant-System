import React, { useState, useEffect } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useParams, useNavigate, replace } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./EditRestaurant.css";

const EditRestaurant = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const authToken = Cookies.get("authToken");

  const [restaurant, setRestaurant] = useState({
    name: "",
    location: "",
    "n-chess": ""
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        const response = await axios.get(
          `http://127.0.0.1:8000/api/Admin/GetResDetails/${id}`,
          { headers: { Authorization:` Bearer ${authToken} `} }
        );
        setRestaurant(response.data.data);
      } catch (error) {
        toast.error("فشل في جلب بيانات المطعم");
      } finally {
        setLoading(false);
      }
    };

    fetchRestaurant();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setRestaurant((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post(
        `http://127.0.0.1:8000/api/Admin/updateRestaurant/${id}`,
        {
          name: restaurant.name,
          location: restaurant.location,
          "n-chess": restaurant["n-chess"]
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );
      toast.success("تم تعديل بيانات المطعم بنجاح");
     navigate(`/restaurant-details/${id}`, { replace: true });
    } catch (error) {
      toast.error("فشل في تعديل بيانات المطعم");
    }
  };

  if (loading) return <p className="loading">جارٍ تحميل البيانات...</p>;

  return (
    <div className="my_container">
    <div className="edit-container">
      <h2>Update Restaurant Data</h2>
      <form onSubmit={handleSubmit} className="edit-form">
        <label>
          Name:
          <input
            type="text"
            name="name"
            value={restaurant.name}
            onChange={handleChange}
            required
          />
        </label>
        <label>
          location:
          <input
            type="text"
            name="location"
            value={restaurant.location}
            onChange={handleChange}
            required
          />
        </label>
        <label>
           Number chess:
          <input
            type="number"
            name="n-chess"
            value={restaurant["n-chess"]}
            onChange={handleChange}
            required
          />
        </label>
        <button type="submit">حفظ التعديلات</button>
      </form>
    </div>
    </div>
  );
};

export default EditRestaurant;