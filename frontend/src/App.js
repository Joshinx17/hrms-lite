import { useEffect, useState } from "react";
import api from "./api";

function App() {
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    api.get("/employees")
      .then(response => {
        setEmployees(response.data);
      })
      .catch(error => {
        console.error("Error fetching employees:", error);
      });
  }, []);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>HRMS Lite</h1>

      <h2>Employees</h2>

      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <ul>
          {employees.map(emp => (
            <li key={emp.id}>
              <strong>{emp.full_name}</strong><br />
              ID: {emp.employee_id}<br />
              Dept: {emp.department}<br />
              Email: {emp.email}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default App;