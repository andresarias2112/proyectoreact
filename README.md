# 📝 Team To-Do

Aplicación web de gestión de tareas en equipo, desarrollada con **React + TypeScript + TailwindCSS**.  
Permite a los usuarios autenticarse, gestionar tareas en tiempo real y trabajar con diferentes roles (👀 *Visor* y ✍️ *Colaborador*).

---

## 🎯 Objetivos del proyecto
- Implementar una aplicación **SPA** moderna con React.
- Manejar **autenticación simple con roles** (viewer y creator).
- Permitir la **creación, edición, eliminación y filtrado** de tareas.
- Persistir datos usando **localStorage** sin necesidad de base de datos externa.
- Desarrollar una interfaz atractiva usando **TailwindCSS**.
- Integrar **alertas dinámicas** con `react-hot-toast`.

---

## ✨ Características principales
- 🔑 **Login con roles** (se guarda en localStorage).
- 📌 **Añadir, editar y eliminar tareas** (solo colaboradores).
- ✅ **Marcar tareas como completadas o pendientes**.
- 🔎 **Búsqueda y filtrado avanzado** por título, descripción, autor y estado.
- 🎨 **UI moderna** con TailwindCSS y gradientes.
- 🔔 **Notificaciones instantáneas** con react-hot-toast.
- 💾 **Persistencia de datos en localStorage**.

---

## 📦 Tecnologías utilizadas
- ⚛️ [React](https://reactjs.org/) + [Vite](https://vitejs.dev/)
- 🟦 TypeScript
- 🎨 [TailwindCSS](https://tailwindcss.com/)
- 🔔 [react-hot-toast](https://react-hot-toast.com/)
- 🗂️ LocalStorage

---
proyectoreact/
├─ public/
│  └─ index.html
├─ src/
│  ├─ components/
│  │  ├─ Login.tsx          # Componente de login con roles
│  │  ├─ TaskList.tsx       # Componente principal de tareas
│  │  └─ TaskItem.tsx       # Componente individual de tarea
│  ├─ App.tsx               # Componente raíz con rutas
│  ├─ main.tsx              # Punto de entrada de React
│  └─ styles.css            # Estilos globales y TailwindCSS
├─ package.json
├─ tsconfig.json
└─ vite.config.ts





⚙️ Flujo de la aplicación

Inicio:

Se abre la app en http://localhost:5173/.

Si el usuario no ha iniciado sesión → redirige a /login.

Si el usuario ya está logueado → redirige a /tasks.

Login:

El usuario ingresa nombre y contraseña.

El sistema valida el usuario en memoria (mock users).

Se guarda la sesión en localStorage (user y role).

Redirige automáticamente a /tasks.

Gestión de tareas:

Los colaboradores pueden añadir, editar o eliminar tareas.

Los visores solo pueden marcar tareas como completadas o pendientes.

Cada acción genera notificaciones instantáneas.

Persistencia:

Todas las tareas se almacenan en localStorage, así como la sesión del usuario.

Recargar la página mantiene usuario y tareas intactas.

Logout:

El usuario puede cerrar sesión, eliminando datos de localStorage.

Redirige automáticamente a /login.

📦 Tecnologías utilizadas

⚛️ React
 + Vite

🟦 TypeScript

🎨 TailwindCSS

🔔 react-hot-toast

🗂️ LocalStorage para persistencia

🚀 Instalación y ejecución
# 1️⃣ Clonar el repositorio
git clone https://github.com/andresarias2112/proyectoreact.git

# 2️⃣ Entrar al directorio
cd proyectoreact

# 3️⃣ Instalar dependencias
npm install

# 4️⃣ Ejecutar en modo desarrollo
npm run dev

# 5️⃣ Abrir en el navegador
# URL por defecto: http://localhost:5173/

📌 Detalles adicionales

La aplicación está diseñada para ser responsiva, funcionando en escritorio y dispositivos móviles.

Los usuarios y roles de prueba están definidos en Login.tsx (andres → creator, juan → viewer).

Las tareas se pueden filtrar en tiempo real usando inputs de búsqueda y selectores de estado.

La UI usa gradientes, sombras y transiciones para dar un aspecto moderno y agradable.