import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import SprintBoard from "./components/SprintBoard";
import TaskRoutes from "./routes/TaskRoutes";
import SprintRoutes from "./routes/SprintRoutes";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SprintBoard />} />
        <Route path="/tasks" element={<TaskRoutes />} />
        <Route path="/sprints" element={<SprintRoutes />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
