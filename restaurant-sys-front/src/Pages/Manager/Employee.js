import EmployeeCard from "../../Component/EmployeeCard";
import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "js-cookie";
import "../Restaurants.css";

export default function Employee() {
  const navigate = useNavigate();
  const [employees, setEmployees] = useState([]);
  const authToken = Cookies.get("authToken");

  useEffect(() => {
    axios
      .get("http://127.0.0.1:8000/api/Manager/GetAllEmployee", {
        headers: { Authorization: `Bearer ${authToken}` },
      })
      .then((response) => {
        setEmployees(response.data.employees);
      })
      .catch((error) => console.error("Error fetching employees:", error));
  }, []);

  const handleCardClick = (id) => {
    navigate(`/Employee-details/${id}`);
    console.log(id);
  };

  return (
    <div className="RightPare">
      <div className="addbutton">
        <button role="button" className="golden-button">
          <Link className="golden-text" to="/Manager/dashborad/selectjob">
            Add
            <i class="fa-solid fa-user-plus" style={{ marginLeft: "5px" }}></i>
          </Link>
        </button>
      </div>

      <div className="cards">
        {employees.map((employee) => (
          <EmployeeCard
            key={employee.id}
            Name={employee.user_name}
            jops={employee.job_name}
            onClick={() => handleCardClick(employee.user_id)}
          />
        ))}
      </div>
    </div>
  );
}
