import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import Cookies from "js-cookie";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "../Categories.css";
import MainCard from "../../Component/MinCard";

export default function Catigory() {
  const navigate = useNavigate();
  const [categories, setCategories] = useState([]);
  const [showConfirm, setShowConfirm] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState(null);
  const authToken = Cookies.get("authToken");
  const restaurantid = Cookies.get("restaurantId");

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = () => {
    axios
      .get(`http://127.0.0.1:8000/api/Manager/GetCategories`, {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        console.log(response);
          setCategories(response.data);
          // toast.success("Categories loaded successfully");
        
      })
      .catch((error) => {
        console.error("Error fetching categories:", error);
        toast.error("Failed to load categories");
      });
  };

  const handleCarddelete = (id) => {
    setCategoryToDelete(id);
    setShowConfirm(true);
  };

  const confirmDelete = () => {
    axios
      .delete(
        `http://127.0.0.1:8000/api/Manager/deleteCatigoryinres/${categoryToDelete}`,
        { headers: { Authorization: `Bearer ${authToken}` } }
      )
      .then(() => {
        fetchCategories();
        toast.success("Category deleted successfully");
      })
      .catch((error) => {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      })
      .finally(() => {
        setShowConfirm(false);
        setCategoryToDelete(null);
      });
  };

  return (
    <div className="RightPare">
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <div className="addbutton">
        <button role="button" className="golden-button">
          <Link className="golden-text" to="/Manager/dashborad/Catigory/selectcatigory">
            Create
            <i
              className="fa-solid fa-list"
              style={{ marginLeft: "10px" }}
            ></i>
            <i class="fa-solid fa-plus" style={{ fontSize:'12px',position:'relative',bottom:'14%',marginLeft:'3px' }}></i>
          </Link>
        </button>
      </div>
      <div className="cards">
        {categories.map((category) => (
          <MainCard
            key={category.id}
            Name={category.category.name}
            onClick={() => handleCarddelete(category.id)}
          />
        ))}
      </div>

      {showConfirm && (
        <div className="confirmation-dialog">
          <div className="dialog-content">
            <p>Are you sure you want to delete this category?</p>
            <div className="dialog-buttons">
              <button onClick={confirmDelete}>Yes</button>
              <button onClick={() => setShowConfirm(false)}>Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
