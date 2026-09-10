"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch("http://localhost:8000/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
        window.location.href = "/";
      } else {
        setError(data.detail || "Error al iniciar sesión");
      }
    } catch (err) {
      setError("Error de conexión");
    }
  };

  return (
    <div className="flex items-center justify-center py-20">
      <div className="max-w-md w-full p-8 bg-white dark:bg-black shadow-xl rounded-2xl border border-gray-100 dark:border-[#144a2d]">
        <h2 className="text-3xl font-black mb-6 text-center text-gray-900 dark:text-white">Iniciar Sesión</h2>
        {error && <div className="bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 p-3 rounded mb-4 text-center font-medium">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Email</label>
            <input 
              type="email" 
              required 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#071a10] text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2 text-gray-700 dark:text-gray-300">Contraseña</label>
            <input 
              type="password" 
              required 
              value={password} 
              onChange={(e) => setPassword(e.target.value)} 
              className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#071a10] text-gray-900 dark:text-white p-3 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition" 
            />
          </div>
          <button type="submit" className="w-full bg-blue-600 text-white p-3 rounded-xl font-black text-lg hover:bg-blue-700 transition shadow-lg shadow-blue-600/30">Entrar</button>
        </form>
        <p className="mt-6 text-center text-sm font-medium text-gray-600 dark:text-gray-400">
          ¿No tienes cuenta? <a href="/register" className="text-blue-600 dark:text-blue-400 hover:underline">Regístrate</a>
        </p>
      </div>
    </div>
  );
}
