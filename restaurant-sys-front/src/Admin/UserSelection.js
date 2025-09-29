import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "./UserSelection.css";
import Card from "../Component/Card";
import Cookies from "js-cookie";

const UserSelection = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        let response = await axios.get(
          "http://127.0.0.1:8000/api/Admin/GetAllManager",
          { headers: { Authorization: `Bearer ${authToken}` } }
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

  if (loading) return <p className="loading">جارٍ التحميل...</p>;
  if (error) return <p className="error">{error}</p>;



  const handleCardClick = (id) => {
    navigate(`/Admin/dashbord/addrestaurant/${id}`);
  };

  return (
    <div className="user-selection-container">
      {" "}
      <h2>Select a manager</h2>{" "}
      <div className="user-list">
        {" "}
        {users.length > 0 ? (
          users.map(
            (user) => (
              console.log(user.username),
              (
                <Card
                  key={user.id}
                  Name={user.id}
                  Owner={user.username}
                  location={user.email}
                  onClick={() => handleCardClick(user.id)}
                />
              )
            )
          )
        ) : (
          <p className="error">لا يوجد مستخدمون متاحون</p>
        )}{" "}
      </div>{" "}
    </div>
  );
};

export default UserSelection;
