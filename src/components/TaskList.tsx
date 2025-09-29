import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";

interface Task {
  id: number;
  author: string;
  title: string;
  description: string;
  completed: boolean;
}

type Role = "viewer" | "creator";

interface TaskListProps {
  user: string;
  role: Role;
  onLogout: () => void;
}

const GLOBAL_KEY = "tasks_global";

function normalizeKey(name: string) {
  return encodeURIComponent(name.trim().toLowerCase().replace(/\s+/g, "_"));
}

function safeParseTasks(raw: string | null): Task[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    // Optional: basic shape check
    return parsed.map((p: any) => ({
      id: Number(p.id) || Date.now(),
      author: String(p.author || "unknown"),
      title: String(p.title || ""),
      description: String(p.description || ""),
      completed: !!p.completed,
    }));
  } catch (e) {
    console.warn("safeParseTasks: JSON parse error:", e);
    return null;
  }
}

export default function TaskList({ user, role, onLogout }: TaskListProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [filter, setFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "completed" | "pending">("all");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");

  const userKey = user ? `tasks_${normalizeKey(user)}` : null;

  // Ref para evitar sobrescribir storage en el primer render/carga
  const didFinishInitialLoadRef = useRef(false);

  // CARGA: cargar tareas desde localStorage (creator -> userKey || global, viewer -> global || user)
  useEffect(() => {
    // Desactivar guardado mientras cargamos
    didFinishInitialLoadRef.current = false;

    if (!user) {
      setTasks([]);
      // marcar cargado en siguiente frame para que el efecto de guardado posterior funcione
      requestAnimationFrame(() => {
        didFinishInitialLoadRef.current = true;
      });
      return;
    }

    try {
      const globalRaw = localStorage.getItem(GLOBAL_KEY);
      const userRaw = userKey ? localStorage.getItem(userKey) : null;

      let parsed: Task[] | null = null;

      if (role === "creator") {
        // Si el creator tiene su propia clave, la usamos; si no, fallback al global
        parsed = safeParseTasks(userRaw) ?? safeParseTasks(globalRaw);
      } else {
        // Viewer: preferimos global, si no existe fallback al user
        parsed = safeParseTasks(globalRaw) ?? safeParseTasks(userRaw);
      }

      if (parsed) {
        setTasks(parsed);
        console.debug("[TaskList] loaded tasks:", parsed);
      } else {
        setTasks([]);
        console.debug("[TaskList] no tasks found, starting empty");
      }
    } catch (err) {
      console.error("[TaskList] error reading storage:", err);
      setTasks([]);
    } finally {
      // Marcar que la carga inicial terminó en el siguiente frame (evita race con el efecto de guardado)
      requestAnimationFrame(() => {
        didFinishInitialLoadRef.current = true;
      });
    }
  }, [user, role, userKey]);

  // GUARDADO: solo después de que la carga inicial haya terminado
  useEffect(() => {
    if (!user) return;
    if (!didFinishInitialLoadRef.current) {
      // evitamos pisar storage con el estado inicial vacío
      console.debug("[TaskList] skip save during initial load");
      return;
    }

    try {
      const payload = JSON.stringify(tasks || []);
      if (role === "creator") {
        if (userKey) {
          localStorage.setItem(userKey, payload);
          console.debug("[TaskList] saved to", userKey, tasks);
        }
        // actualizar global para viewers: aquí mantenemos la misma estrategia (global = última versión del creator)
        localStorage.setItem(GLOBAL_KEY, payload);
        console.debug("[TaskList] saved to", GLOBAL_KEY);
      } else {
        // viewer no guarda
      }
    } catch (err) {
      console.error("[TaskList] error saving to localStorage:", err);
    }
  }, [tasks, user, role, userKey]);

  // Sincronizar cambios hechos en otras pestañas (storage event)
  useEffect(() => {
    function onStorage(e: StorageEvent) {
      if (!user) return;
      if (e.key === GLOBAL_KEY || e.key === userKey) {
        // Volver a cargar desde storage pero sin desactivar el guardado (ya que la carga ya ocurrió)
        try {
          const raw = localStorage.getItem(e.key || "");
          const parsed = safeParseTasks(raw);
          if (parsed) {
            setTasks(parsed);
            console.debug("[TaskList] storage event loaded tasks from", e.key);
          } else {
            // si se borró la clave -> limpiar
            setTasks([]);
            console.debug("[TaskList] storage event: key cleared", e.key);
          }
        } catch (err) {
          console.warn("[TaskList] storage event parse error", err);
        }
      }
    }
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, [userKey, user]);

  // Helpers
  const ensureCreator = (actionName = "realizar esta acción") => {
    if (role !== "creator") {
      toast.error("No tienes permisos para " + actionName);
      return false;
    }
    return true;
  };

  const addTask = () => {
    if (!ensureCreator("añadir tareas")) return;
    if (title.trim() === "") {
      toast.error("El título no puede estar vacío");
      return;
    }
    const newTask: Task = {
      id: Date.now(),
      author: user,
      title: title.trim(),
      description: description.trim(),
      completed: false,
    };
    setTasks((prev) => [...prev, newTask]);
    setTitle("");
    setDescription("");
    toast.success("Tarea añadida ✅");
  };

  const toggleTask = (id: number) => {
    if (!ensureCreator("cambiar el estado")) return;
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !t.completed } : t)));
    toast("Estado actualizado");
  };

  const deleteTask = (id: number) => {
    if (!ensureCreator("eliminar tareas")) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    toast.error("Tarea eliminada ❌");
  };

  const saveEdit = (id: number) => {
    if (!ensureCreator("editar tareas")) return;
    if (editTitle.trim() === "") {
      toast.error("El título no puede quedar vacío");
      return;
    }
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, title: editTitle.trim(), description: editDescription.trim() } : t)));
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
    toast.success("Tarea editada ✏️");
  };

  const filteredTasks = tasks
    .filter((t) => {
      const q = filter.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q)
      );
    })
    .filter((t) => {
      if (statusFilter === "completed") return t.completed;
      if (statusFilter === "pending") return !t.completed;
      return true;
    });

  return (
    <div className="max-w-4xl mx-auto bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl p-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-extrabold text-white">Team To-Do</h1>
        <button
          onClick={onLogout}
          className="px-3 py-2 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white shadow hover:scale-105 transition"
        >
          Salir
        </button>
      </div>

      <p className="mb-6 text-white/90">
        Bienvenido <strong>{user}</strong> ({role === "creator" ? "Colaborador" : "Visor"})
      </p>

      {role === "creator" && (
        <div className="flex flex-col gap-3 mb-6">
          <input
            type="text"
            placeholder="Título de la tarea"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border-0 focus:ring-4 focus:ring-pink-300 outline-none"
          />
          <textarea
            placeholder="Descripción de la tarea"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border-0 focus:ring-4 focus:ring-pink-300 outline-none"
          />
          <button
            onClick={addTask}
            className="self-start px-4 py-3 rounded-xl bg-gradient-to-r from-blue-400 to-blue-500 text-white font-bold shadow hover:scale-105 transition"
          >
            Añadir
          </button>
        </div>
      )}

      <input
        type="text"
        placeholder="Buscar por título, descripción o autor"
        value={filter}
        onChange={(e) => setFilter(e.target.value)}
        className="w-full p-3 rounded-xl bg-white/20 text-white placeholder-white/70 border-0 mb-4 focus:ring-4 focus:ring-pink-300 outline-none"
      />

      {/* Filtros */}
      <div className="flex gap-3 mb-6">
        {(["all", "completed", "pending"] as const).map((status) => (
          <button
            key={status}
            onClick={() => setStatusFilter(status)}
            className={`px-4 py-2 rounded-xl font-bold shadow transition ${
              statusFilter === status
                ? "bg-gradient-to-r from-pink-400 to-pink-500 text-white"
                : "bg-white/20 text-white hover:scale-105"
            }`}
          >
            {status === "all" ? "Todas" : status === "completed" ? "Completadas" : "Pendientes"}
          </button>
        ))}
      </div>

      {/* Lista de tareas */}
      <ul className="space-y-3">
        {filteredTasks.map((task) => (
          <li
            key={task.id}
            className={`p-4 rounded-2xl shadow transition hover:scale-[1.01] ${
              task.completed ? "bg-green-400/30 text-white" : "bg-white/20 text-white"
            }`}
          >
            {editingId === task.id ? (
              <div className="flex flex-col gap-2">
                <input
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  className="p-2 rounded-xl bg-white/30 text-white border-0 focus:ring-4 focus:ring-pink-300 outline-none"
                />
                <textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  className="p-2 rounded-xl bg-white/30 text-white border-0 focus:ring-4 focus:ring-pink-300 outline-none"
                />
              </div>
            ) : (
              <div>
                <h2 className={`text-lg font-semibold ${task.completed ? "line-through text-white/70" : ""}`}>
                  {task.title}
                </h2>
                <p className={`text-sm mt-1 ${task.completed ? "line-through text-white/70" : ""}`}>
                  {task.description}
                </p>
                <span className="text-xs text-white/60">Autor: {task.author}</span>
              </div>
            )}

            <div className="flex gap-2 items-center mt-2">
              <input
                type="checkbox"
                checked={task.completed}
                onChange={() => toggleTask(task.id)}
                disabled={role === "viewer"}
                className="w-5 h-5 accent-pink-400"
              />
              {role === "creator" && (
                <>
                  {editingId === task.id ? (
                    <button
                      onClick={() => saveEdit(task.id)}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-green-400 to-green-500 text-white shadow hover:scale-105 transition"
                    >
                      Guardar
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingId(task.id);
                        setEditTitle(task.title);
                        setEditDescription(task.description);
                      }}
                      className="px-3 py-1 rounded-xl bg-gradient-to-r from-yellow-400 to-yellow-500 text-white shadow hover:scale-105 transition"
                    >
                      Editar
                    </button>
                  )}
                  <button
                    onClick={() => deleteTask(task.id)}
                    className="px-3 py-1 rounded-xl bg-gradient-to-r from-red-400 to-red-500 text-white shadow hover:scale-105 transition"
                  >
                    Eliminar
                  </button>
                </>
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
