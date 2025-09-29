import React, { useState } from "react";
import axios from "axios";
import "./MackComplaint.css";
import Cookies from "js-cookie";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

export default function MackComplaint() {
  const [discription, setDiscription] = useState("");
  const [context, setContext] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const token = Cookies.get("authToken");

      const response = await axios.post(
        "http://127.0.0.1:8000/api/CreateComplain",
        {
          discription,
          context,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success(response.data.message, {
        position: "top-right",
        autoClose: 3000,
      });

      setDiscription("");
      setContext("");
    } catch (error) {
      console.error(error);
      toast.error("حدث خطأ أثناء إرسال الشكوى", {
        position: "top-right",
        autoClose: 3000,
      });
    }
  };

  return (
    <div className="complaint-container">
      <h2 className="complaint-title">Submit a review/complaint</h2>
      <form onSubmit={handleSubmit} className="complaint-form">
        <input
          type="text"
          placeholder="the address"
          value={discription}
          onChange={(e) => setDiscription(e.target.value)}
          className="complaint-input"
          required
        />
        <textarea
          placeholder="Text"
          value={context}
          onChange={(e) => setContext(e.target.value)}
          className="complaint-textarea"
          required
        ></textarea>
        <button type="submit" className="complaint-button">
          send
        </button>
      </form>
    </div>
  );
}