import { useState } from "react";
import { useNavigate } from "react-router-dom";

type Role = "viewer" | "creator";

interface LoginProps {
  onLogin: (username: string, role: Role) => void;
}

// 🔹 Usuarios de ejemplo
const mockUsers = [
  { username: "andres", password: "123", role: "creator" as Role },
  { username: "juan", password: "123", role: "viewer" as Role },
];

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleLogin = () => {
    if (!username.trim() || !password.trim()) {
      setError("Completa todos los campos");
      return;
    }

    const user = mockUsers.find((u) => u.username === username);

    if (!user) {
      setError("Usuario no encontrado");
      return;
    }

    if (user.password !== password) {
      setError("Contraseña incorrecta");
      return;
    }

    onLogin(user.username, user.role);
    navigate("/tasks");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-5xl font-extrabold text-white text-center mb-6">
          Team To-Do
        </h1>

        <input
          type="text"
          placeholder="Nombre de usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded-lg border-0 w-full mb-4 bg-white/30 text-white placeholder-white/70 focus:ring-4 focus:ring-pink-300 outline-none"
        />

        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="p-3 rounded-lg border-0 w-full mb-4 bg-white/30 text-white placeholder-white/70 focus:ring-4 focus:ring-pink-300 outline-none"
        />

        {error && (
          <div className="text-red-500 mb-4 text-center">{error}</div>
        )}

        <button
          onClick={handleLogin}
          className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold shadow hover:scale-105 transition w-full"
        >
          Iniciar Sesión
        </button>
      </div>
    </div>
  );
}
