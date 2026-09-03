"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";

export default function SearchBar() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState("");

  // Efecto para limpiar o actualizar la barra de búsqueda si la URL cambia
  // (por ejemplo, si el usuario hace click en una categoría en la barra lateral)
  useEffect(() => {
    setQuery(searchParams.get("q") || "");
  }, [searchParams]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      router.push(`/?q=${encodeURIComponent(query.trim())}`);
    } else {
      router.push(`/`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="w-full">
      <input 
        type="text" 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Buscar noticias, equipos, jugadores..." 
        className="w-full border border-gray-300 rounded-full px-4 py-2 text-sm focus:outline-none focus:border-black transition"
      />
    </form>
  );
}
