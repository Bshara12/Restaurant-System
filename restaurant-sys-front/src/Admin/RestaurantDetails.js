import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./RestaurantDetails.css";
import { useNavigate } from "react-router-dom";

const RestaurantDetails = () => {
  const [restaurant, setRestaurant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const authToken = Cookies.get("authToken");
  const $id = window.location.pathname.split("/").slice(-1)[0];
  const navigate = useNavigate();
  useEffect(() => {
    const fetchRestaurant = async () => {
      try {
        let response = await axios.get(
          `http://127.0.0.1:8000/api/Admin/GetResDetails/${$id}`,
          { headers: { Authorization: ` Bearer ${authToken}` } }
        );
        setRestaurant(response.data.data);
      } catch (err) {
        setError("فشل في جلب بيانات المطعم");
      } finally {
        setLoading(false);
      }
    };
    fetchRestaurant();
  }, [$id]);

  const handleDelete = () => {
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/Admin/deleteRestaurant/${$id}`,
        { headers: { Authorization: ` Bearer ${authToken}` } }
      );
      toast.success("تم حذف المطعم بنجاح");
      setTimeout(() => {
        window.location.href = "/Admin/dashbord/restaurants";
      }, 2000);
    } catch (error) {
      toast.error("فشل في حذف المطعم");
    } finally {
      setShowModal(false);
    }
  };

  if (loading) return <p className="loading">جارٍ التحميل...</p>;
  if (error) return <p className="error">{error}</p>;

  return (
    <div className="my_container">
      <div className="restaurant-details">
        <h2>Restaurant Details</h2>
        <p>
          <strong>Name:</strong> {restaurant?.name}
        </p>
        <p>
          <strong>Owner:</strong> {restaurant?.user?.username || "غير معروف"}
        </p>
        <p>
          <strong>Location:</strong> {restaurant?.location}
        </p>
        <p>
          <strong>Number Chess:</strong> {restaurant?.["n-chess"]}
        </p>
        <p>
          <strong>Created At:</strong>{" "}
          {restaurant?.created_at
            ? new Date(restaurant.created_at).toLocaleDateString()
            : "غير متوفر"}
        </p>
        <p>
          <strong>Updated At:</strong>{" "}
          {restaurant?.updated_at
            ? new Date(restaurant.updated_at).toLocaleDateString()
            : "غير متوفر"}
        </p>
        <div className="buttons">
          {/* <button style={{ background: "#0d3666" }}>Update</button> */}

          <button
            style={{ background: "#0d3666" }}
            onClick={() => navigate(`/Admin/dashbord/restaurant/edit/${$id}`)}
          >
            Update
          </button>

          <button style={{ background: "red" }} onClick={handleDelete}>
            Delete
          </button>
        </div>
      </div>

      {showModal && (
        <div className="modal">
          <div className="modal-content">
            <h3>Confirm deletion</h3>
            <p>Are you sure you want to delete this restaurant?</p>
            <button onClick={confirmDelete} style={{ background: "red" }}>
              delete
            </button>
            <button
              onClick={() => setShowModal(false)}
              style={{ background: "#7f7fe5" }}
            >
              Cancel{" "}
            </button>
        </div>
        </div>
      )}  
    </div>
  );
};

export default RestaurantDetails;
