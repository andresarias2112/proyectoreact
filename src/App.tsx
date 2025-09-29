import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import Login from "./components/Login";
import TaskList from "./components/TaskList";

type Role = "viewer" | "creator";

export default function App() {
  const [user, setUser] = useState<string | null>(null);
  const [role, setRole] = useState<Role | null>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem("user");
    const savedRole = localStorage.getItem("role");
    if (savedUser) setUser(savedUser);
    if (savedRole) setRole(savedRole as Role);
  }, []);

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
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-6">
      <Toaster position="top-right" />
      {!user || !role ? (
        <Login onLogin={(u, r) => { setUser(u); setRole(r); }} />
      ) : (
        <TaskList user={user} role={role} onLogout={handleLogout} />
      )}
    </div>
  );
}
