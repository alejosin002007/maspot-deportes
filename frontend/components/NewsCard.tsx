"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export default function NewsCard({ item, defaultSaved = false }: { item: any, defaultSaved?: boolean }) {
  const [isSaved, setIsSaved] = useState(defaultSaved);
  const [token, setToken] = useState<string | null>(null);
  
  // 1. Creamos un estado para guardar el título traducido, inicializado con el original
  const [titulo, setTitulo] = useState<string>(item.title);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    
    async function traducir() {
      // Si el título ya viene en español (ej. La Liga) o es vacío, evitamos la petición
      const ligasEspanol = ["La Liga", "Liga Argentina", "Internacional", "MLS"];
      if (!item.title || ligasEspanol.includes(item.category)) return;

      try {
        // Usamos la API oculta de Google Translate que no tiene restricciones de CORS ni Cloudflare (mejor que Lingva)
        const res = await fetch(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=es&dt=t&q=${encodeURIComponent(item.title)}`);
        const data = await res.json();
        if (data && data[0] && data[0][0] && data[0][0][0]) {
          setTitulo(data[0][0][0]);
        }
      } catch (error) {
        console.error("Error al traducir tarjeta:", error);
        // Si falla la API, el estado conserva el 'tituloOriginal' por seguridad
      }
    }

    traducir();
  }, [item.title, item.category]);

  const toggleSave = async (e: any) => {
    e.preventDefault();
    if (!token) return alert("Debes iniciar sesión para guardar noticias");
    
    try {
      const res = await fetch(`https://maspot-deportes.onrender.com/api/favoritos/${item.id}`, {
        method: isSaved ? "DELETE" : "POST",
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) setIsSaved(!isSaved);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <a href={item.link || "#"} target="_blank" rel="noopener noreferrer" className="block group h-full">
      <article className="bg-white dark:bg-black rounded-2xl shadow-sm border border-gray-200 dark:border-[#144a2d] overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full relative">
        
        <button onClick={toggleSave} className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${isSaved ? "bg-yellow-400 text-white shadow-lg" : "bg-black/30 text-white hover:bg-black/50"}`}>
          <Star className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
        </button>

        <div className="aspect-video bg-gray-100 dark:bg-gray-700 w-full relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
        </div>
        <div className="p-4 flex flex-col flex-1">
          <div className="text-[10px] text-emerald-600 dark:text-emerald-400 font-black uppercase tracking-widest mb-2">{item.category}</div>
          <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100 mb-3 leading-snug group-hover:text-emerald-600 dark:group-hover:text-emerald-400 transition-colors line-clamp-3">{titulo}</h3>
          <div className="mt-auto pt-3 border-t border-gray-100 dark:border-[#144a2d] text-xs text-gray-400 dark:text-gray-500 font-medium flex items-center">
            <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {item.time}
          </div>
        </div>
      </article>
    </a>
  );
}
