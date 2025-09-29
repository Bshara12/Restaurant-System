import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import Card from "../Component/Card";
import "./Restaurants.css";

export default function Restaurants() {
  const navigate = useNavigate();
  const [restaurants, setRestaurants] = useState([]);
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/Admin/GetAllRest", {
        headers: { Authorization: ` Bearer ${authToken}` },
      })
      .then((response) => {
        if (response.data.message === "Restaurants fetched successfully") {
          setRestaurants(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching restaurants:", error));
  }, []);

  const handleCardClick = (id) => {
    navigate(`/restaurant-details/${id}`);
  };

  return (
    <div className="RightPare">
      {" "}
      <div className="addbutton">
        {" "}
        <button role="button" className="golden-button">
          {" "}
          <Link className="golden-text" to="/Admin/dashbord/UserSelection">
            {" "}
            Add{" "}
            <i
              className="fa-solid fa-plus"
              style={{ marginLeft: "5px" }}
            ></i>{" "}
          </Link>{" "}
        </button>{" "}
      </div>{" "}
      <div className="cards">
        {" "}
        {restaurants.map((restaurant) => (
          <Card
            key={restaurant.id}
            Name={restaurant.name}
            Owner={`Owner ${restaurant.user_name}`}
            location={restaurant.location}
            onClick={() => handleCardClick(restaurant.id)}
          />
        ))}{" "}
      </div>{" "}
    </div>
  );
}
