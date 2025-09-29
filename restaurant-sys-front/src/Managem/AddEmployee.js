import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Admin/Addmanager.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";
import Cookies from "js-cookie";


export default function AddEmployee() {

  const JobID = window.location.pathname.split("/").slice(-1)[0];
  const authToken = Cookies.get("authToken");
  const restaurantId = Cookies.get("restaurantId");

  

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    job_id:JobID,
    // reastaurant_id:restaurantId
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log(formData);
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/Manager/CreateEmployee", formData,{
        headers: { Authorization: ` Bearer ${authToken}` },
      });
      toast.success("The employee has been created successfully");
      setFormData({ username: "", email: "", password: "" }); // تصفير الفورم
      navigate("/Manager/dashborad/employee", { replace: true });

    } catch (error) {
      toast.error("Failed to create employee. Check data.");
    }
  };

  return (
    <div className="my_container">
      <form onSubmit={handleSubmit} className="mainform">
        <h2 className="title">Create Employee</h2>

        <div className="textInputWrapper">
          <input
            placeholder="Name"
            type="text"
            className="textInput"
            name="username"
            value={formData.username}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-user"></i>
        </div>

        <div className="textInputWrapper">
          <input
            placeholder="Email"
            type="email"
            className="textInput"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-envelope"></i>
        </div>

        <div className="textInputWrapper">
          <input
            placeholder="Password"
            type="password"
            className="textInput"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <i className="fa-solid fa-lock"></i>
        </div>

        <button className="button" type="submit">
          <p>Create</p>
        </button>
      </form>
      <ToastContainer />
    </div>
  );
}
