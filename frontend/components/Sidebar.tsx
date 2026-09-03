"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const searchParams = useSearchParams();
  const currentDisciplina = searchParams.get("disciplina");

  const [user, setUser] = useState<{ nombre: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setUser(null);
    window.location.href = "/";
  };

  const isTodas = !currentDisciplina;

  const getLinkClass = (isActive: boolean) => {
    return `block px-4 py-2 rounded transition ${
      isActive 
        ? "bg-gray-800 text-white font-bold border-l-4 border-blue-500" 
        : "text-gray-300 hover:bg-gray-800 hover:text-white"
    }`;
  };

  return (
    <aside className="w-64 bg-black text-white flex flex-col h-full border-r border-gray-800 shrink-0">
      <div className="p-6 pb-2">
        <h1 className="text-2xl font-black italic tracking-tighter text-blue-500">MASPOT<span className="text-white">DEPORTES</span></h1>
      </div>

      <div className="mb-6 p-4 mx-2 bg-gray-900 rounded-lg">
        {user ? (
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Bienvenido,</span>
            <span className="font-bold text-lg mb-2">{user.nombre}</span>
            <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 text-left">Cerrar sesión</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-center text-sm font-bold py-2 rounded">
              Iniciar Sesión
            </Link>
            <Link href="/register" className="border border-gray-600 hover:bg-gray-800 text-center text-sm font-bold py-2 rounded">
              Registrarse
            </Link>
          </div>
        )}
      </div>

      <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
        <Link href="/" className={getLinkClass(isTodas)}>
          Todas las Noticias
        </Link>
        <Link href="/?disciplina=Fútbol" className={getLinkClass(currentDisciplina === "Fútbol")}>
          Fútbol
        </Link>
        <Link href="/?disciplina=Tenis" className={getLinkClass(currentDisciplina === "Tenis")}>
          Tenis
        </Link>
        <Link href="/?disciplina=Básquetbol" className={getLinkClass(currentDisciplina === "Básquetbol")}>
          Básquet
        </Link>
        <Link href="/?disciplina=Fórmula 1" className={getLinkClass(currentDisciplina === "Fórmula 1")}>
          Fórmula 1
        </Link>
        <Link href="/?disciplina=Hockey" className={getLinkClass(currentDisciplina === "Hockey")}>
          Hockey
        </Link>
        <Link href="/?disciplina=Rugby" className={getLinkClass(currentDisciplina === "Rugby")}>
          Rugby
        </Link>
      </nav>
    </aside>
  );
}
