import { useState } from "react";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Cookies from "js-cookie";
import "./AddCatigory.css";
import { useNavigate } from "react-router-dom";

export default function AddCatigory() {
  const [name, setName] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const authToken = Cookies.get("authToken");


    try {
      const response = await axios.post(
        "http://127.0.0.1:8000/api/Admin/CreateCatigory",
        {
          name: name,
        },
        { headers: { Authorization: `Bearer ${authToken}` } }
      );

      toast.success("The category has been added successfully.");
      setName("");
      navigate("/Admin/dashbord/Catigories", { replace: true });
    } catch (error) {
      if (
        error.response &&
        error.response.data &&
        error.response.data.message
      ) {
        toast.error(`Failed to add: ${error.response.data.message}`);
      } else {
        toast.error("error occurred while connecting to the server.");
      }
    }
  };

  return (
    <div className="my_container">
      <div className="mycard">
        <h2 className="text-xl font-bold mb-4">Add New Catigory</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            placeholder="Catigory Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="border p-2 w-full rounded"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            Add
          </button>
        </form>
      </div>
      <ToastContainer position="top-center" autoClose={3000} />
    </div>
  );
}
