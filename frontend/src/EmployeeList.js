import { useEffect, useState } from "react";
import API from "./api";

function EmployeeList({ refresh }) {
  const [employees, setEmployees] = useState([]);

  const fetchEmployees = async () => {
    const res = await API.get("/employees");
    setEmployees(res.data);
  };

  const deleteEmployee = async (employeeId) => {
    await API.delete(`/employees/${employeeId}`);
    fetchEmployees();
  };

  useEffect(() => {
    fetchEmployees();
  }, [refresh]);

  return (
    <div>
      <h2>Employees</h2>

      {employees.length === 0 && <p>No employees yet</p>}

      <ul>
        {employees.map((emp) => (
          <li key={emp.employee_id}>
            {emp.full_name} ({emp.department}){" "}
            <button onClick={() => deleteEmployee(emp.employee_id)}>Delete</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default EmployeeList;