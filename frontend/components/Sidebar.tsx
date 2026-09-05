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

  return (
    <aside className="w-64 bg-black text-white flex flex-col h-full border-r border-gray-800 shrink-0">
      <div className="p-6">
        <h1 className="text-2xl font-black text-blue-600 dark:text-blue-400 tracking-tighter italic">
          MASPOT<span className="text-white">FUTBOL</span>
        </h1>
      </div>

      <div className="mb-6 p-4 mx-2 bg-gray-900 rounded-lg">
        {user ? (
          <div className="flex flex-col">
            <span className="text-sm text-gray-400">Bienvenido,</span>
            <span className="font-bold text-lg mb-2">{user.nombre}</span>
            <button onClick={handleLogout} className="text-xs text-red-500 hover:text-red-400 text-left">Cerrar sesion</button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            <Link href="/login" className="bg-blue-600 hover:bg-blue-700 text-center text-sm text-white font-bold py-2 rounded">
              Iniciar Sesion
            </Link>
            <Link href="/register" className="border border-gray-300 dark:border-gray-600 hover:bg-gray-200 dark:hover:bg-gray-800 text-center text-sm font-bold py-2 rounded">
              Registrarse
            </Link>
          </div>
        )}
      </div>

      <nav className="flex-1 overflow-y-auto mt-4 custom-scrollbar px-3">
        <ul className="space-y-1">
          <li>
            <Link href="/" className="block px-4 py-3 rounded-xl font-bold bg-blue-600 text-white shadow-md hover:bg-blue-700 transition">
              Todas las Ligas
            </Link>
          </li>
          <li><Link href="/?disciplina=La%20Liga" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">La Liga (ES)</Link></li>
          <li><Link href="/?disciplina=Premier%20League" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Premier League (EN)</Link></li>
          <li><Link href="/?disciplina=Serie%20A" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Serie A (IT)</Link></li>
          <li><Link href="/?disciplina=Bundesliga" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Bundesliga (DE)</Link></li>
          <li><Link href="/?disciplina=Ligue%201" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Ligue 1 (FR)</Link></li>
          <li><Link href="/?disciplina=Liga%20Argentina" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Liga Argentina (AR)</Link></li>
          <li><Link href="/?disciplina=Brasileirao" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Brasileirao (BR)</Link></li>
          <li><Link href="/?disciplina=Primeira%20Liga" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Primeira Liga (PT)</Link></li>
          <li><Link href="/?disciplina=MLS" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">MLS (US)</Link></li>
          <li><Link href="/?disciplina=Eredivisie" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Eredivisie (NL)</Link></li>
          <li><Link href="/?disciplina=Liga%20MX" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Liga MX (MX)</Link></li>
          <li><Link href="/?disciplina=Futbol%20Internacional" className="block px-4 py-2.5 text-gray-400 font-medium hover:bg-gray-800 rounded-xl transition">Internacional</Link></li>
        </ul>
      </nav>
    </aside>
  );
}
