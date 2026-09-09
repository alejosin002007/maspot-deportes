'use client';

import React, { useState, useRef } from 'react';

export default function MatchSlider({ initialMatches, selectedCategory }: { initialMatches: any[], selectedCategory?: string }) {
  const [localFilter, setLocalFilter] = useState("Todas");
  const scrollRef = useRef<HTMLDivElement>(null);
  
  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth + 50 : scrollLeft + clientWidth - 50;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  }

  // Filtrado de partidos
  let matches = initialMatches;
  if (selectedCategory) {
    matches = initialMatches.filter((m: any) => m.category.toLowerCase() === selectedCategory.toLowerCase());
  } else if (localFilter !== "Todas") {
    matches = initialMatches.filter((m: any) => m.category.toLowerCase() === localFilter.toLowerCase());
  }

  const leagues = Array.from(new Set(initialMatches.map(m => m.category))).filter(Boolean).sort();

  return (
    <section>
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <h2 className="text-2xl font-bold dark:text-white">Resultados y Próximos Partidos</h2>
        {!selectedCategory && (
          <select 
            value={localFilter} 
            onChange={(e) => setLocalFilter(e.target.value)}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-xl px-4 py-2 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm cursor-pointer transition-all"
          >
            <option value="Todas">🏆 Mostrar Todas</option>
            {leagues.map(l => (
              <option key={l as string} value={l as string}>{l as string}</option>
            ))}
          </select>
        )}
      </div>

      <div className="relative group">
        {/* Boton Izquierda */}
        {matches.length > 0 && (
            <button 
                onClick={() => scroll('left')} 
                className="absolute -left-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl text-emerald-600 dark:text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0"
            >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M15 19l-7-7 7-7" /></svg>
            </button>
        )}

        <div ref={scrollRef} className="flex space-x-6 overflow-x-auto pb-4 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden [-ms-overflow-style:none] [scrollbar-width:none]">
          {matches.map((match: any) => (
            <div key={match.id} className="min-w-[320px] bg-white dark:bg-gray-800 rounded-2xl shadow-sm hover:shadow-md transition-shadow border border-gray-200 dark:border-gray-700 shrink-0 overflow-hidden flex flex-col snap-start">
              <div className="bg-gray-50 dark:bg-gray-700/50 px-4 py-2 flex justify-between items-center border-b border-gray-200 dark:border-gray-700">
                <span className="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                  {match.category}
                </span>
                <div className="flex items-center text-xs font-bold uppercase tracking-widest text-gray-500 dark:text-gray-400">
                    {match.status === 'EN CURSO' && (
                      <span className="relative flex h-2 w-2 mr-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
                      </span>
                    )}
                    <span className={match.status === 'EN CURSO' || match.status === 'ENTRETIEMPO' ? 'text-red-500 dark:text-red-400' : ''}>
                        {match.status === 'PROGRAMADO' && match.hora ? `${match.fecha} - ${match.hora}HS` : match.status}
                    </span>
                </div>
              </div>
              <div className="p-5 flex justify-between items-center flex-1">
                <div className="flex flex-col items-center w-1/3">
                  {match.logoA ? <img src={match.logoA} alt={match.teamA} className="w-12 h-12 object-contain mb-2 drop-shadow-sm" /> : <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-2"></div>}
                  <span className="font-semibold text-sm text-center dark:text-white line-clamp-2 leading-tight">{match.teamA}</span>
                </div>
                <div className="flex flex-col items-center justify-center w-1/3 px-2">
                  <span className="text-3xl font-black text-gray-900 dark:text-white tracking-tighter">
                    {match.status === 'PROGRAMADO' ? 'VS' : match.score}
                  </span>
                </div>
                <div className="flex flex-col items-center w-1/3">
                  {match.logoB ? <img src={match.logoB} alt={match.teamB} className="w-12 h-12 object-contain mb-2 drop-shadow-sm" /> : <div className="w-12 h-12 bg-gray-100 dark:bg-gray-700 rounded-full mb-2"></div>}
                  <span className="font-semibold text-sm text-center dark:text-white line-clamp-2 leading-tight">{match.teamB}</span>
                </div>
              </div>
            </div>
          ))}
          {matches.length === 0 && <div className="w-full text-center py-10 text-gray-500">No hay partidos para mostrar.</div>}
        </div>

        {matches.length > 0 && (
            <button onClick={() => scroll('right')} className="absolute -right-4 top-1/2 -translate-y-1/2 z-10 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-xl text-emerald-600 dark:text-emerald-400 w-12 h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 hover:scale-110 disabled:opacity-0">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" /></svg>
            </button>
        )}
      </div>
    </section>
  );
}