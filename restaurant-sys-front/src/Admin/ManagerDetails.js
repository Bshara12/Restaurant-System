import React, { useEffect, useState } from "react";
import axios from "axios";
import "./ManagerDetails.css";
import Cookies from "js-cookie";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const ManagerDetails = () => {
  const navigate = useNavigate();

  const [manager, setManager] = useState(null);
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const authToken = Cookies.get("authToken");

  const $id = window.location.pathname.split("/").slice(-1)[0];

  const handleCardClick = (id) => {
    navigate(`/restaurant-details/${id}`);
  };

  useEffect(() => {
    axios
      .get(`http://127.0.0.1:8000/api/Admin/GetManagerDetails/${$id}`, {
        headers: { Authorization: ` Bearer ${authToken}` },
      })
      .then((response) => {
        if (response.data.message === "Manager details fetched successfully") {
          setManager(response.data.data.Manager);
          setRestaurants(response.data.data.Restaurants);
        }
      })
      .catch((error) => setError("Error fetching manager details"))
      .finally(() => setLoading(false));
  }, [$id]);

  const handleDelete = () => {
    setShowModal(true);
  };

  const confirmDelete = async () => {
    try {
      await axios.delete(
        `http://127.0.0.1:8000/api/Admin/DeleteUser/${$id}`,
        { headers: { Authorization: ` Bearer ${authToken}` } }
      );
      toast.success("Manager deleted succes");
     navigate("/Admin/dashbord/Manager",{replace:true});
    } catch (error) {
      toast.error("فشل في حذف المطعم");
    } finally {
      setShowModal(false);
    }
  };

  if (loading) return <p>Loading...</p>;
  if (error) return <p>{error}</p>;

  return (
    <div className="my_container">
      <div className="manager-details-container">
        {" "}
        <h2>Manager details</h2>{" "}
        {manager && (
          <div className="manager-info">
            {" "}
            <p>
              <strong>name:</strong> {manager.username}
            </p>{" "}
            <p>
              <strong>email :</strong> {manager.email}
            </p>{" "}
            <p>
              <strong>role:</strong> {manager.role}
            </p>{" "}
            <p>
              <strong>Creation date:</strong>{" "}
              {new Date(manager.created_at).toLocaleDateString()}
            </p>{" "}
          </div>
        )}{" "}
        <h3>Restaurants for this manager:</h3>{" "}
        <ul className="restaurant-list">
          {" "}
          {restaurants.map((restaurant) => (
            <li
              key={restaurant.id}
              className="restaurant-item"
              onClick={() => handleCardClick(restaurant.id)}
            >
              {" "}
              <strong>{restaurant.name}</strong> - {restaurant.location} (Number
              of tables: {restaurant["n-chess"]}){" "}
            </li>
          ))}{" "}
        </ul>{" "}
        <div className="buttons">
          <button onClick={handleDelete} style={{ background: "red" }}>
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

export default ManagerDetails;
