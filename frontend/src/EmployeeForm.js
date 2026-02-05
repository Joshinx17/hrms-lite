import { useState } from "react";
import API from "./api";

function EmployeeForm({ onEmployeeAdded }) {
  const [form, setForm] = useState({
    employee_id: "",
    full_name: "",
    email: "",
    department: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await API.post("/employees", form);
      alert("Employee added successfully");
      setForm({
        employee_id: "",
        full_name: "",
        email: "",
        department: "",
      });
      onEmployeeAdded();
    } catch (err) {
      alert(err.response?.data?.detail || "Something went wrong");
    }
  };

  return (
    <div>
      <h2>Add Employee</h2>
      <form onSubmit={handleSubmit}>
        <input name="employee_id" placeholder="Employee ID" value={form.employee_id} onChange={handleChange} required /><br />
        <input name="full_name" placeholder="Full Name" value={form.full_name} onChange={handleChange} required /><br />
        <input name="email" placeholder="Email" value={form.email} onChange={handleChange} required /><br />
        <input name="department" placeholder="Department" value={form.department} onChange={handleChange} required /><br /><br />
        <button type="submit">Add Employee</button>
      </form>
    </div>
  );
}

export default EmployeeForm;