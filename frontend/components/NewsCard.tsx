"use client";

import { useState, useEffect } from "react";
import { Star } from "lucide-react";

export default function NewsCard({ item, defaultSaved = false }: { item: any, defaultSaved?: boolean }) {
  const [isSaved, setIsSaved] = useState(defaultSaved);
  const [token, setToken] = useState<string | null>(null);

  useEffect(() => {
    setToken(localStorage.getItem("token"));
    // Ideally we would sync with backend favorited state here
  }, []);

  const toggleSave = async (e: any) => {
    e.preventDefault();
    if (!token) return alert("Debes iniciar sesión para guardar noticias");
    
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/favoritos/${item.id}`, {
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
      <article className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 overflow-hidden flex flex-col hover:-translate-y-2 hover:shadow-2xl transition-all duration-300 h-full relative">
        
        <button onClick={toggleSave} className={`absolute top-4 right-4 z-10 p-2 rounded-full backdrop-blur-md transition-colors ${isSaved ? "bg-yellow-400 text-white shadow-lg" : "bg-black/30 text-white hover:bg-black/50"}`}>
          <Star className={`w-5 h-5 ${isSaved ? "fill-white" : ""}`} />
        </button>

        <div className="aspect-[4/3] sm:aspect-video bg-gray-100 dark:bg-gray-700 w-full relative overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={item.img} alt={item.title} className="w-full h-full object-cover group-hover:scale-110 transition duration-700" />
        </div>
        <div className="p-6 flex flex-col flex-1">
          <div className="text-xs text-blue-600 dark:text-blue-400 font-black uppercase tracking-widest mb-3">{item.category}</div>
          <h3 className="text-2xl font-black text-gray-900 dark:text-gray-100 mb-4 leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">{item.title}</h3>
          <div className="mt-auto pt-4 border-t border-gray-100 dark:border-gray-700 text-sm text-gray-400 dark:text-gray-500 font-medium flex items-center">
            <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            {item.time}
          </div>
        </div>
      </article>
    </a>
  );
}
