import { useEffect, useState } from "react";
import MessageCard from "../../Component/MessageCard";
import "./Complaints.css";
import { toast } from "react-toastify";
import axios from "axios";
import Cookies from "js-cookie";

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  const restaurantId = Cookies.get("restaurantId");
  const BASE_URL = "http://127.0.0.1:8000/api/Manager";

  const authToken = Cookies.get("authToken");

  // دالة لجلب الشكاوى
  const fetchComplaints = async () => {
    try {
      const response = await axios.get(
        `${BASE_URL}/GetComplaints`,
        {
          headers: {
            Authorization: `Bearer ${authToken}`,
          },
        }
      );
      setComplaints(response.data.complaints);
    } catch (error) {
      toast.error("Failed to bring complaints");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const deleteComplaint = async (id) => {
    try {
      await axios.delete(`${BASE_URL}/DeleteComplain/${id}`, {
        headers: {
          Authorization: `Bearer ${authToken}`,
        },
      });
      toast.success("The complaint has been successfully deleted");
      setComplaints((prev) => prev.filter((complaint) => complaint.id !== id));
    } catch (error) {
      toast.error("Failed to delete complaint");
      console.error(error);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  if (loading) {
    return <div className="paddingcontainer">Loading...</div>;
  }

  return (
    <div className="paddingcontainer">
      <h1>Complaints</h1>
      {complaints.length === 0 ? (
        <p>No complaints.</p>
      ) : (
        complaints.map((complaint) => (
          <div key={complaint.id}>
            <MessageCard
              context={complaint.context}
              discription={complaint.discription}
              onClick={() => deleteComplaint(complaint.id)}
            />
          </div>
        ))
      )}
    </div>
  );
}
