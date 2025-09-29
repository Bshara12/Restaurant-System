import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import Card from "../Component/Card";

export default function SelectRestaurant() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const userId = Cookies.get("userid");
    const token = Cookies.get("authToken");

    if (!userId || !token) {
      setError("User is not logged in.");
      setLoading(false);
      return;
    }

    axios
      .get(`http://127.0.0.1:8000/api/Admin/GetManagerDetails/${userId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      .then((response) => {
        const data = response.data.data.Restaurants;
        const restaurantsData = Array.isArray(data)
          ? data
          : [data].filter(Boolean);

        if (restaurantsData.length === 0) {
          setError("This user does not own any restaurants...Call Admin to Add Your Restaurant");
        } else if (restaurantsData.length === 1) {
          const singleRestaurant = restaurantsData[0];
          Cookies.set("restaurantId", singleRestaurant.id);
          navigate("/Manager/dashborad");
        } else {
          setRestaurants(restaurantsData);
        }

        setLoading(false);
      })
      .catch((err) => {
        console.error("API Error:", err);
        setError("This user does not own any restaurants.");
        setLoading(false);
      });
  }, [navigate]);

  const handleSelectRestaurant = (id) => {
    Cookies.set("restaurantId", id);
    navigate("/Manager/dashborad");
  };
 
  if (loading) return <p>Loading data...</p>;

  if (error)
    return (
      <div className="my_container">
        <p style={{ color: "goldenrod", fontWeight: "bold",fontSize:'20px' }}>{error}</p>
      </div>
    );
  return (

    <div className="user-selection-container">
      {" "}
      <h2>Select a manager</h2>{" "}
      <div className="user-list">
        {" "}
        {restaurants.length > 0 ? (
          restaurants.map((restaurant) => (
            <Card
              key={restaurant.id}
              Name={restaurant.name}
              Owner={restaurant.location}
              location={restaurant["n-chess"]}
              onClick={() => handleSelectRestaurant(restaurant.id)}
            />
          ))
        ) : (
          <p className="error">No users available</p>
        )}{" "}
      </div>{" "}
    </div>
  );
}
