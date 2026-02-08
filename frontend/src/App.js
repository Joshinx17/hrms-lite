import { useEffect, useState } from "react";
import api from "./api";

function App() {
  // -----------------------
  // STATE
  // -----------------------
  const [selectedDepartment, setSelectedDepartment] = useState("ALL");
  const [employees, setEmployees] = useState([]);
  const [attendance, setAttendance] = useState([]);
  const [selectedEmployee, setSelectedEmployee] = useState(null);

  const [form, setForm] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });

  // -----------------------
  // API FUNCTIONS
  // -----------------------

  const fetchEmployees = () => {
    api
      .get("/employees")
      .then((res) => setEmployees(res.data))
      .catch((err) => console.error(err));
  };

  const fetchAttendance = async (employeeId) => {
    try {
      const response = await api.get(`/attendance/${employeeId}`);
      setAttendance(response.data);
      setSelectedEmployee(employeeId);
    } catch (error) {
      alert("Could not load attendance");
    }
  };

  const markAttendance = async (employeeId, status) => {
    try {
      await api.post("/attendance", {
        employee_id: employeeId,
        date: new Date().toISOString().split("T")[0],
        status: status,
      });

      alert(`Marked ${status} for ${employeeId}`);
    } catch (error) {
      alert("Failed to mark attendance");
    }
  };

  const deleteEmployee = (employee_id) => {
    if (!window.confirm("Delete this employee?")) return;

    api
      .delete(`/employees/${employee_id}`)
      .then(() => {
        setEmployees((prev) =>
          prev.filter((emp) => emp.employee_id !== employee_id),
        );
      })
      .catch(() => alert("Delete failed"));
  };

  // -----------------------
  // FORM HANDLERS
  // -----------------------

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    api
      .post("/employees", form)
      .then(() => {
        fetchEmployees();
        setForm({
          employee_id: "",
          full_name: "",
          email: "",
          department: "",
        });
      })
      .catch((err) =>
        alert(err.response?.data?.detail || "Error adding employee"),
      );
  };

  // -----------------------
  // ON LOAD
  // -----------------------

  useEffect(() => {
    fetchEmployees();
  }, []);

  // -----------------------
  // UI
  // -----------------------

  const getAttendanceSummary = () => {
    let present = 0;
    let absent = 0;

    attendance.forEach((record) => {
      if (record.status === "Present") present++;
      if (record.status === "Absent") absent++;
    });

    return { present, absent };
  };

  const departments = [
    "ALL",
    ...new Set(employees.map((emp) => emp.department)),
  ];

  const filteredEmployees =
    selectedDepartment === "ALL"
      ? employees
      : employees.filter((emp) => emp.department === selectedDepartment);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", maxWidth: "600px" }}>
      <h1>HRMS Lite</h1>

      <h2>Add Employee</h2>

      <form onSubmit={handleSubmit}>
        <input
          name="employee_id"
          placeholder="Employee ID"
          value={form.employee_id}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          name="full_name"
          placeholder="Full Name"
          value={form.full_name}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          name="email"
          placeholder="Email"
          value={form.email}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <input
          name="department"
          placeholder="Department"
          value={form.department}
          onChange={handleChange}
          required
        />
        <br />
        <br />

        <button type="submit">Add Employee</button>
      </form>

      <hr />

      <label>
        Filter by Department:&nbsp;
        <select
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
        >
          {departments.map((dep) => (
            <option key={dep} value={dep}>
              {dep}
            </option>
          ))}
        </select>
      </label>

      <hr />

      <h2>Employees</h2>

      {employees.length === 0 ? (
        <p>No employees found</p>
      ) : (
        <>
          <ul>
            {filteredEmployees.map((emp) => (
              <li key={emp.id} style={{ marginBottom: "15px" }}>
                <strong>{emp.full_name}</strong>
                <br />
                ID: {emp.employee_id}
                <br />
                Dept: {emp.department}
                <br />
                Email: {emp.email}
                <br />
                <br />
                <button
                  onClick={() => markAttendance(emp.employee_id, "Present")}
                  style={{ marginRight: "5px" }}
                >
                  ✅ Present
                </button>
                <button
                  onClick={() => markAttendance(emp.employee_id, "Absent")}
                  style={{ marginRight: "5px" }}
                >
                  ❌ Absent
                </button>
                <button
                  onClick={() => fetchAttendance(emp.employee_id)}
                  style={{ marginRight: "5px" }}
                >
                  📊 View Attendance
                </button>
                <button onClick={() => deleteEmployee(emp.employee_id)}>
                  🗑 Delete
                </button>
              </li>
            ))}
          </ul>

          {selectedEmployee && (
            <div style={{ marginTop: "30px" }}>
              <h2>Attendance for {selectedEmployee}</h2>
              {(() => {
                const summary = getAttendanceSummary();
                return (
                  <p>
                    ✅ Present: {summary.present} &nbsp; | &nbsp; ❌ Absent:{" "}
                    {summary.absent}
                  </p>
                );
              })()}

              {attendance.length === 0 ? (
                <p>No attendance records</p>
              ) : (
                <ul>
                  {attendance.map((record, index) => (
                    <li key={index}>
                      {record.date} → {record.status}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default App;
