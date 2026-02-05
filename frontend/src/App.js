import { useState } from "react";
import EmployeeForm from "./EmployeeForm";
import EmployeeList from "./EmployeeList";

function App() {
  const [refresh, setRefresh] = useState(false);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial" }}>
      <h1>HRMS Lite</h1>

      <EmployeeForm onEmployeeAdded={() => setRefresh(!refresh)} />
      <hr />
      <EmployeeList refresh={refresh} />
    </div>
  );
}

export default App;