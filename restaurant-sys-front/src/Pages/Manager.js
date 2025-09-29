import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Card from "../Component/Card";
import "./Manager.css";
import Cookies from "js-cookie";


export default function Manager() {
  const navigate = useNavigate();
  const [managers, setManagers] = useState([]);
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    axios.get("http://127.0.0.1:8000/api/Admin/GetAllManager",
      { headers: { Authorization: ` Bearer ${authToken}` } })
      .then((response) => {
        if (response.data.message === "Managers fetched successfully") {
          setManagers(response.data.data);
        }
      })
      .catch((error) => console.error("Error fetching managers:", error));
  }, []);

  const handleCardClick = (username) => {
    navigate(`/manager-details/${username}`);
  };

  return (
    <div className="RightPare">
      {" "}
      <div className="addbutton">
        {" "}
        <button role="button" className="golden-button">
          {" "}
          <Link className="golden-text" to="/Admin/dashbord/addmanager">
            {" "}
            Create{" "}
            <i
              className="fa-solid fa-user-plus"
              style={{ marginLeft: "10px" }}
            ></i>{" "}
          </Link>{" "}
        </button>{" "}
      </div>{" "}
      <div className="cards">
        {" "}
        {managers.map((manager) => (
          <Card
            key={manager.id}
            Name={manager.username}
            Owner={manager.email}
            location={manager.role}
            onClick={() => handleCardClick(manager.id)}
          />
        ))}{" "}
      </div>{" "}
    </div>
  );
}
