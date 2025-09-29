import { useState } from "react";

type Role = "viewer" | "creator";

interface LoginProps {
  onLogin: (username: string, role: Role) => void;
}

export default function Login({ onLogin }: LoginProps) {
  const [username, setUsername] = useState("");

  return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="bg-white/20 backdrop-blur-md rounded-2xl shadow-xl p-8 max-w-md w-full">
        <h1 className="text-5xl font-extrabold text-white text-center mb-6">
          Team To-Do
        </h1>
        <input
          type="text"
          placeholder="Escribe tu nombre"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          className="p-3 rounded-lg border-0 w-full mb-6 bg-white/30 text-white placeholder-white/70 focus:ring-4 focus:ring-pink-300 outline-none"
        />
        <div className="flex flex-col gap-3">
          <button
            onClick={() => username.trim() && onLogin(username.trim(), "creator")}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white font-bold shadow hover:scale-105 transition"
          >
            Entrar como Colaborador
          </button>
          <button
            onClick={() => username.trim() && onLogin(username.trim(), "viewer")}
            className="px-4 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold shadow hover:scale-105 transition"
          >
            Entrar como Visor
          </button>
        </div>
      </div>
    </div>
  );
}
