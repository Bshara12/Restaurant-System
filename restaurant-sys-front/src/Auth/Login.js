import { useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import "./Login.css";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate(); // لإنشاء وظيفة التوجيه

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post("http://127.0.0.1:8000/api/login", {
        email,
        password,
      });
      toast.success(`Welcom ${response.data.data.user.username}`, {
        position: "top-right",
      });
      console.log(response);
      const token = response.data.data.token; // نفترض أن API يعيد role بجانب token
      const id = response.data.data.user.id;
      const role = response.data.data.user.role;
      Cookies.set("authToken", token, { expires: 7, secure: true });
      Cookies.set("userid", id, { expires: 7, secure: true });
      Cookies.set("role", role, { expires: 7, secure: true });

      if (role === "admin" || role === "Admin") {
        navigate("/Admin/dashbord/restaurants", { replace: true });
      } else if (role === "manager" || role === "Manager") {
        navigate("/Manager/dashborad/employee");
      }
      else if (role === "Chef" || role === "chef") {
        navigate('/Chef/dashboard/orders')
      }
      else if (role === "DJ" || role === 'dj') {
        navigate('/DJ/dashboard/music')
      }
      else if (role === "Waiters" || role === 'waiters') {
        navigate('/Waiters/dashboard/orders')
      }
      else if(role ==="Parking"||role==='parking'){
        navigate('/Parking/dashboard/car')
      }

      console.log("Login Successful:", response.data);
    } catch (error) {
      toast.error("فشل تسجيل الدخول! تحقق من البريد وكلمة المرور.", {
        position: "top-right",
      });

      console.error("Login Failed:", error.response?.data || error.message);
    }
  };

  return (
    <div className="mycontainer">
      <div className="login-box">
        <label className="title">Log In</label>
        <form style={{ width: "100%" }} onSubmit={handleLogin}>
          <div className="user-box">
            <input
              type="text"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
            <label>Email</label>
          </div>
          <div className="user-box" style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
            <label>Password</label>
            <span
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "10px",
                top: "30%",
                transform: "translateY(-50%)",
                cursor: "pointer",
              }}
            >
              {showPassword ? (
                <i className="fa-solid fa-eye" style={{ color: "gold" }}></i>
              ) : (
                <i
                  className="fa-solid fa-eye-slash"
                  style={{ color: "gold" }}
                ></i>
              )}
            </span>
          </div>
          <center>
            <button type="submit" className="login-button">
              SEND
            </button>
          </center>
        </form>
      </div>
      <ToastContainer />
    </div>
  );
}
