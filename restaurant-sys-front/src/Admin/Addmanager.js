import React, { useState } from "react";
import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./Addmanager.css";
import { ToastContainer } from "react-toastify";
import { useNavigate } from "react-router-dom";

export default function Addmanager() {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role: "Manager",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await axios.post("http://127.0.0.1:8000/api/register", formData);
      toast.success("تم إنشاء المدير بنجاح");
      setFormData({ username: "", email: "", password: "" }); // تصفير الفورم
      navigate("/Admin/dashbord/Manager", { replace: true });

    } catch (error) {
      toast.error("فشل في إنشاء المدير. تأكد من البيانات.");
    }
  };

  return (
    <div className="my_container">
      <form onSubmit={handleSubmit} className="mainform">
        <h2 className="title">Create Manager</h2>

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
