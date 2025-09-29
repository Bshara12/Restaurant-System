import { Outlet, useLocation, useNavigate } from "react-router-dom";
import { Link } from "react-router-dom";
import { useState, useEffect } from "react";
import "../Admin/DashBourd.css";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function WaitersDashboard() {
  const location = useLocation();
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState();
  const [collapsed, setCollapsed] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  useEffect(() => {
    setActiveLink(location.pathname);
  }, [location.pathname]);

  const handleLogout = async () => {
    const token = Cookies.get("authToken");
    try {
      const response = await fetch("http://127.0.0.1:8000/api/logout", {
        method: "GET",
        headers: {
          Authorization: ` Bearer ${token}`,
        },
      });

      if (response.ok) {
        localStorage.removeItem("token");
        toast.success("Logged out successfully!");
        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        toast.error("Logout failed. Please try again.");
      }
    } catch (error) {
      toast.error("Error during logout. Please try again.");
      console.error("Error during logout:", error);
    }
  };

  return (
    <div className="maincontainer">
      <ToastContainer
        position="top-right"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className={`sidpare ${collapsed ? "collapsed" : ""}`}>
        <img
          src={require("../Assets/logores2.png")}
          alt="Logo"
          className={collapsed ? "small" : ""}
        />
        <div className="longright" onClick={() => setCollapsed(!collapsed)}>
          <i
            className={`fa-solid fa-arrow-right-long ${collapsed ? "expanded" : ""
              }`}
          ></i>
        </div>
        <div style={{ width: "100%" }}>
          <Link
            to="/Waiters/dashboard/orders"
            className={
              activeLink === "/Waiters/dashboard/orders" ? "active-link" : ""
            }
          >
            <i className="fa-solid fa-receipt"></i>
            <p>Orders</p>
          </Link>
          <Link
            to="/Waiters/dashboard/messages"
            className={
              activeLink === "/Waiters/dashboard/messages" ? "active-link" : ""
            }
          >
            <i className="fa-solid fa-comments"></i>
            <p>Messages</p>
          </Link>
          <Link
            to="/Waiters/dashboard/Table"
            className={
              activeLink === "/Waiters/dashboard/Table" ? "active-link" : ""
            }
          >
            <i className="fa-solid fa-table"></i>
            <p>Table</p>
          </Link>


          <Link
            to="/Waiters/dashboard/invoice"
            className={
              activeLink === "/Waiters/dashboard/invoice"
                ? "active-link"
                : ""
            }
          >
            <i class="fa-solid fa-file-invoice-dollar"></i>
            <p>invoice</p>
          </Link>


          <Link
            to="/Waiters/dashboard/Complaints"
            className={
              activeLink === "/Waiters/dashboard/Complaints"
                ? "active-link"
                : ""
            }
          >
            <i className="fa-solid fa-comment"></i>
            <p>Complaints</p>
          </Link>

          <div
            onClick={() => window.open("https://wa.me/0938246910", "_blank")}
            className="logout-link"
            style={{ cursor: "pointer" }}
          >
            <i className="fa-solid fa-phone"></i>
            <p>Contact us</p>
          </div>

          <div
            onClick={() => setShowLogoutConfirm(true)}
            className="logout-link"
          >
            <i className="fa-solid fa-right-from-bracket"></i>
            {/* {!collapsed && ""} */}
            <p>Log Out</p>
          </div>
        </div>
      </div>

      <Outlet />

      {showLogoutConfirm && (
        <div className="popup-overlay">
          <div className="popup-box">
            <p>Are you sure you want to log out?</p>
            <div className="popup-buttons">
              <button onClick={handleLogout} className="confirm-btn">
                Yes
              </button>
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="cancel-btn"
              >
                Cuncle
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
