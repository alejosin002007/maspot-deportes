"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

export default function Sidebar() {
  const searchParams = useSearchParams();
  const currentDisciplina = searchParams.get("disciplina");

  const [user, setUser] = useState<{ nombre: string } | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Botón flotante hamburguesa para móvil */}
      <button 
        className="md:hidden fixed bottom-6 right-6 z-50 bg-emerald-600 text-white p-4 rounded-full shadow-2xl flex items-center justify-center"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
        )}
      </button>

      {/* Overlay fondo oscuro */}
      {isOpen && (
        <div 
          className="md:hidden fixed inset-0 bg-black/60 z-40 backdrop-blur-sm"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed md:relative z-50 md:z-0 w-64 bg-gray-900 text-white flex flex-col h-full border-r border-gray-800 shrink-0 transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
        <div className="p-6">
          <Link href="/" className="block hover:opacity-80 transition cursor-pointer" onClick={() => setIsOpen(false)}>
            <h1 className="text-2xl font-black text-emerald-500 tracking-tighter italic drop-shadow-md">
              MASPOT<span className="text-white">FUTBOL</span>
            </h1>
          </Link>
        </div>

        <div className="mb-6 p-4 mx-2 bg-gray-900/80 rounded-xl border border-gray-700/50 shadow-inner">
          {user ? (
            <div className="flex flex-col">
              <span className="text-sm text-gray-400">Bienvenido,</span>
              <span className="font-bold text-lg mb-2 text-emerald-400">{user.nombre}</span>
              <button onClick={handleLogout} className="text-xs text-red-400 hover:text-red-300 text-left font-medium border-t border-gray-700/50 pt-2 mt-1">Cerrar sesión</button>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <Link href="/login" onClick={() => setIsOpen(false)} className="bg-emerald-600 hover:bg-emerald-500 text-center text-sm text-white font-bold py-2 rounded-lg transition-colors shadow-md">
                Iniciar Sesión
              </Link>
              <Link href="/register" onClick={() => setIsOpen(false)} className="border border-gray-600 hover:bg-gray-700 text-center text-sm text-gray-300 font-bold py-2 rounded-lg transition-colors">
                Registrarse
              </Link>
            </div>
          )}
        </div>

        <nav className="flex-1 overflow-y-auto mt-2 custom-scrollbar px-3 pb-4">
          <ul className="space-y-1.5">
            <li>
              <Link href="/" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-3 rounded-xl font-bold transition-all transform hover:scale-[1.02] ${isTodas ? 'bg-gradient-to-r from-emerald-600 to-emerald-500 text-white shadow-lg' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}>
                <span className="mr-3 text-lg">🌎</span> Todas las Ligas
              </Link>
            </li>
            <li><Link href="/?disciplina=La%20Liga" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'La Liga' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/es.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="ES"/> La Liga</Link></li>
            <li><Link href="/?disciplina=Premier%20League" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Premier League' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/gb-eng.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="EN"/> Premier League</Link></li>
            <li><Link href="/?disciplina=Serie%20A" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Serie A' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/it.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="IT"/> Serie A</Link></li>
            <li><Link href="/?disciplina=Bundesliga" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Bundesliga' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/de.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="DE"/> Bundesliga</Link></li>
            <li><Link href="/?disciplina=Ligue%201" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Ligue 1' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/fr.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="FR"/> Ligue 1</Link></li>
            <li><Link href="/?disciplina=Liga%20Argentina" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Liga Argentina' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/ar.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="AR"/> Liga Argentina</Link></li>
            <li><Link href="/?disciplina=Brasileirao" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Brasileirao' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/br.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="BR"/> Brasileirão</Link></li>
            <li><Link href="/?disciplina=Primeira%20Liga" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Primeira Liga' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/pt.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="PT"/> Primeira Liga</Link></li>
            <li><Link href="/?disciplina=MLS" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'MLS' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/us.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="US"/> MLS</Link></li>
            <li><Link href="/?disciplina=Eredivisie" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Eredivisie' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><img src="https://flagcdn.com/w20/nl.png" className="w-5 h-auto mr-3 shadow-sm rounded-sm" alt="NL"/> Eredivisie</Link></li>
            <li><Link href="/?disciplina=Internacional" onClick={() => setIsOpen(false)} className={`flex items-center px-4 py-2.5 font-medium rounded-xl transition-colors ${currentDisciplina === 'Internacional' ? 'bg-emerald-600 text-white shadow-md' : 'text-gray-300 hover:bg-[#111111] hover:text-white'}`}><span className="mr-3 text-lg">✈️</span> Internacional</Link></li>
          </ul>
        </nav>
      </aside>
    </>
  );
}
