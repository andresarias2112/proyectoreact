import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import TaskList from "./components/TaskList";

type Role = "viewer" | "creator";

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  // Recupera usuario y rol del localStorage al cargar la app
  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");
    if (savedUser) setUser(savedUser);
    if (savedRole) setRole(savedRole as Role);
  }, []);

  // Guarda usuario y rol en localStorage al cambiar
  useEffect(() => {
    if (user) localStorage.setItem("user", user);
    if (role) localStorage.setItem("role", role);
  }, [user, role]);

  const handleLogout = () => {
    setUser(null);
    setRole(null);
    localStorage.removeItem("user");
    localStorage.removeItem("role");
  };

  return (
    <BrowserRouter>
      <Toaster position="top-right" />
      <Routes>
        {/* Redirige de "/" a "/login" */}
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Ruta de login */}
        <Route
          path="/login"
          element={<Login onLogin={(u, r) => { setUser(u); setRole(r); }} />}
        />

        {/* Ruta de tareas */}
        <Route
          path="/tasks"
          element={
            user && role ? (
              <TaskList user={user} role={role} onLogout={handleLogout} />
            ) : (
              <Navigate to="/login" replace />
            )
          }
        />

        {/* Cualquier otra url */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
