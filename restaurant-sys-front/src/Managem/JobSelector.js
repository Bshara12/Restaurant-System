import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import "../Admin/UserSelection.css";
import Card from "../Component/Card";
import Cookies from "js-cookie";
import MainCard from "../Component/MinCard";
import Card3D from "../Component/Card3D";

const JobSelector = () => {
  const [Jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        let response = await axios.get(
          "http://127.0.0.1:8000/api/Manager/GetAllJop",
          { headers: { Authorization: `Bearer ${authToken}` } }
        );
        console.log("Fetched Jobs:", response.data.jobs);
        if (Array.isArray(response.data.jobs)) {
          setJobs(response.data.jobs);
        } else {
          setError("البيانات المستلمة ليست بتنسيق المصفوفة المتوقعة");
        }
      } catch (err) {
        console.error("Error fetching Jobs:", err);
        setError("فشل في جلب بيانات المستخدمين");
      } finally {
        setLoading(false);
      }
    };
    fetchJobs();
  }, []);

  if (loading) return <p className="loading">جارٍ التحميل...</p>;
  if (error) return <p className="error">{error}</p>;



  const handleCardClick = (id) => {
    navigate(`/Manager/dashborad/addemployee/${id}`);
  };

  return (
    <div className="user-selection-container">
      {" "}
      <h2>Select a Job</h2>{" "}
      <div className="user-list">
        {" "}
        {Jobs.length > 0 ? (
          Jobs.map(
            (Job) => (
              console.log(Job.username),
              (
                <Card3D
                  key={Job.id}
                  Name={Job.name}
                  onClick={() => handleCardClick(Job.id)}
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

export default JobSelector;
