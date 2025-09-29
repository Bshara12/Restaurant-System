import React, { useState } from "react";
import Cookies from "js-cookie";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./AddTable.css";

export default function AddTable() {
  const [tableNumber, setTableNumber] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    console.log('tableNumber'+tableNumber);

    e.preventDefault();
    // const restaurantId = Cookies.get("restaurantId");
    const authToken = Cookies.get("authToken");

    if (!tableNumber) {
      toast.error("Please enter your table number and confirm your login.");
      return;
    }
    setLoading(true);
    console.log(authToken)
    try {
      const response = await fetch(
        `http://127.0.0.1:8000/api/Manager/CreateTable`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
          body: JSON.stringify({ table_number: tableNumber }),
        }
      );

      if (response.ok) {
        toast.success("Table added successfully!");
        setTableNumber("");
        setTimeout(() => {
          navigate("/Manager/dashborad/Table");
        }, 2000);
      } else {
        toast.error("An error occurred while adding.");
      }
    } catch (error) {
      toast.error("Could not connect to the server.");
    }

    setLoading(false);
  };

  return (
    <>
      <ToastContainer position="top-right" />
      <div className="my_container">
        <form className="form_card" onSubmit={handleSubmit}>
          <h2 className="form_title">Add a table</h2>
          <input
            type="number"
            placeholder="Table number"
            value={tableNumber}
            onChange={(e) => setTableNumber(e.target.value)}
            className="form_input"
          />
          <button type="submit" className="form_button" disabled={loading}>
            {loading ? "Adding..." : "addition"}
          </button>
        </form>
      </div>
    </>
  );
}
