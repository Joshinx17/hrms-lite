import axios from "axios";

const API_BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8000";

export const API = {
  getEmployees: () => fetch(`${API_BASE_URL}/employees`).then(r => r.json()),
  createEmployee: (data) => fetch(`${API_BASE_URL}/employees`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data)
  }).then(r => r.json()),
  // ... other endpoints
};

export default API;