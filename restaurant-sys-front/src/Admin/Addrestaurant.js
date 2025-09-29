import "./Addrestaurant.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function Addrestaurant() {
  const [restaurantName, setRestaurantName] = useState("");
  const [restaurantLocation, setRestaurantLocation] = useState("");
  const [nchess, setnchess] = useState("");
  const authToken = Cookies.get("authToken");
  const $id = window.location.pathname.split("/").slice(-1)[0];
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      let response = await axios.post(
        "http://127.0.0.1:8000/api/Admin/CreateRestaurent",
        {
          user_id: $id,
          name: restaurantName,
          location: restaurantLocation,
          ["n-chess"]: nchess,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      if (response.status === 201) {
        toast.success("Add succes", {
          position: "top-right",
        });
        navigate("/Admin/dashbord/restaurants", { replace: true });
      }
    } catch (error) {
      console.error("Error adding restaurant:", error);
      toast.error("error in add restaurant", {
        position: "top-right",
      });
    }
  };

  return (
    <div className="my_container">
      <form onSubmit={handleSubmit} className="mainform">
        <h2 className="title">Add Restaurant</h2>
        <div className="textInputWrapper">
          <input
            placeholder="Restaurant Name"
            type="text"
            className="textInput"
            value={restaurantName}
            onChange={(e) => setRestaurantName(e.target.value)}
            required
          />
          <i className="fa-solid fa-id-card"></i>
        </div>
        <div className="textInputWrapper">
          <input
            placeholder="Location"
            type="text"
            className="textInput"
            value={restaurantLocation}
            onChange={(e) => setRestaurantLocation(e.target.value)}
            required
          />
          <i className="fa-solid fa-flag"></i>
        </div>
        <div className="textInputWrapper">
          <input
            placeholder="number chess"
            type="number"
            className="textInput"
            value={nchess}
            onChange={(e) => setnchess(e.target.value)}
            required
          />
          <i className="fa-solid fa-flag"></i>
        </div>
        <button type="submit" className="button">
          <p>Add</p>
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}
