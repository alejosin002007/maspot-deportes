"use client";
import AdBanner from '@/components/AdBanner';
import { useState, useEffect } from "react";


const getRowColor = (liga: string, pos: number, total: number) => {
  if (['eng.1', 'esp.1', 'ita.1'].includes(liga)) {
    if (pos <= 4) return 'bg-blue-600 text-white';
    if (pos === 5) return 'bg-orange-500 text-white';
    if (pos === 6) return 'bg-emerald-600 text-white';
    if (pos >= 18) return 'bg-red-600 text-white';
  } else if (liga === 'ger.1') {
    if (pos <= 4) return 'bg-blue-600 text-white';
    if (pos === 5) return 'bg-orange-500 text-white';
    if (pos === 6) return 'bg-emerald-600 text-white';
    if (pos === 16) return 'bg-red-400 text-white';
    if (pos >= 17) return 'bg-red-600 text-white';
  } else if (liga === 'fra.1') {
    if (pos <= 3) return 'bg-blue-600 text-white';
    if (pos === 4) return 'bg-cyan-600 text-white';
    if (pos === 5) return 'bg-orange-500 text-white';
    if (pos === 6) return 'bg-emerald-600 text-white';
    if (pos === 16) return 'bg-red-400 text-white';
    if (pos >= 17) return 'bg-red-600 text-white';
  } else if (liga === 'arg.1') {
    if (pos <= 3) return 'bg-blue-600 text-white';
    if (pos >= 4 && pos <= 9) return 'bg-orange-500 text-white';
    if (pos >= total - 1) return 'bg-red-600 text-white';
  } else if (liga === 'bra.1') {
    if (pos <= 4) return 'bg-blue-600 text-white';
    if (pos >= 5 && pos <= 6) return 'bg-cyan-600 text-white';
    if (pos >= 7 && pos <= 12) return 'bg-orange-500 text-white';
    if (pos >= 17) return 'bg-red-600 text-white';
  } else if (liga === 'ned.1') {
    if (pos <= 2) return 'bg-blue-600 text-white';
    if (pos === 3) return 'bg-cyan-600 text-white';
    if (pos === 4) return 'bg-orange-500 text-white';
    if (pos >= 5 && pos <= 8) return 'bg-emerald-600 text-white';
    if (pos === 16) return 'bg-red-400 text-white';
    if (pos >= 17) return 'bg-red-600 text-white';
  }
  return 'text-gray-400';
};

const renderLegend = (liga: string) => {
  if (['eng.1', 'esp.1', 'ita.1'].includes(liga)) {
    return (
      <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-800 flex flex-wrap items-center gap-4 text-[11px] text-gray-300">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Champions League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Europa League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Conference League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Descenso</div>
      </div>
    );
  } else if (liga === 'ger.1' || liga === 'fra.1') {
    return (
      <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-800 flex flex-wrap items-center gap-4 text-[11px] text-gray-300">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Champions League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-600"></span> Clasif. Champions</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Europa League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Conference League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400"></span> Playoff Descenso</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Descenso</div>
      </div>
    );
  } else if (liga === 'arg.1') {
    return (
      <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-800 flex flex-wrap items-center gap-4 text-[11px] text-gray-300">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Copa Libertadores</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Copa Sudamericana</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Descenso</div>
      </div>
    );
  } else if (liga === 'bra.1') {
    return (
      <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-800 flex flex-wrap items-center gap-4 text-[11px] text-gray-300">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Copa Libertadores</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-600"></span> Clasif. Libertadores</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Copa Sudamericana</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Descenso</div>
      </div>
    );
  } else if (liga === 'ned.1') {
    return (
      <div className="bg-gray-800/50 px-4 py-2 border-t border-gray-800 flex flex-wrap items-center gap-4 text-[11px] text-gray-300">
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-blue-600"></span> Champions League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-cyan-600"></span> Clasif. Champions</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-orange-500"></span> Europa League</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-emerald-600"></span> Playoff Conference</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-400"></span> Playoff Descenso</div>
        <div className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-sm bg-red-600"></span> Descenso</div>
      </div>
    );
  }
  return null;
}

export default function ClasificacionClient() {
  const [liga, setLiga] = useState("eng.1");
  const [jornada, setJornada] = useState(0); // 0 = actual
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [expandedStats, setExpandedStats] = useState<Record<number, boolean>>({});

  const ligasOptions = [
    { id: "eng.1", name: "Premier League" },
    { id: "esp.1", name: "La Liga" },
    { id: "ita.1", name: "Serie A" },
    { id: "ger.1", name: "Bundesliga" },
    { id: "fra.1", name: "Ligue 1" },
    { id: "arg.1", name: "Liga Argentina" },
    { id: "bra.1", name: "Brasileirão" }
  ];

  useEffect(() => {
    const fetchStandings = async () => {
      setLoading(true);
      try {
        const res = await fetch(`http://localhost:8000/api/clasificacion?liga=${liga}&jornada=${jornada}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
          if (jornada === 0 && json.jornada) {
            const num = parseInt(json.jornada.replace("FECHA ", ""));
            if (!isNaN(num)) setJornada(num);
          }
        } else {
          setData(null);
        }
      } catch (err) {
        console.error(err);
      }
      setLoading(false);
    };
    fetchStandings();
  }, [liga, jornada]);

  const matchesByDate: Record<string, any[]> = {};
  if (data?.partidos) {
    data.partidos.forEach((m: any) => {
      if (!matchesByDate[m.fecha]) matchesByDate[m.fecha] = [];
      matchesByDate[m.fecha].push(m);
    });
  }

  const toggleStat = (index: number) => {
    setExpandedStats(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const handleLigaChange = (e: any) => {
    setLiga(e.target.value);
    setJornada(0);
    setExpandedStats({});
  };

  return (
    <div className="flex flex-col gap-6 pb-10 w-full px-2 lg:px-8 mx-auto">
      {/* CABECERA */}
      <div className="flex flex-col sm:flex-row justify-between items-center gap-4 bg-gray-900 p-6 rounded-2xl shadow-sm border border-gray-800">
        <h1 className="text-3xl font-black text-white uppercase tracking-wider">Clasificación</h1>
        <select 
          value={liga} 
          onChange={handleLigaChange}
          className="w-full sm:w-64 bg-gray-950 border border-gray-800 text-white rounded-xl px-4 py-3 font-bold focus:outline-none focus:ring-2 focus:ring-emerald-500 shadow-sm"
        >
          {ligasOptions.map(l => (
            <option key={l.id} value={l.id}>{l.name}</option>
          ))}
        </select>
      </div>

      {loading && !data ? (
        <div className="py-20 text-center font-bold text-gray-500 text-xl animate-pulse">
          Cargando datos de la liga...
        </div>
      ) : !data ? (
        <div className="py-20 text-center font-bold text-gray-500 text-xl">
          Error al cargar los datos.
        </div>
      ) : (
        <div className="flex flex-col gap-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 xl:gap-8">
            
            {/* COLUMNA IZQUIERDA: TABLA Y ESTADISTICAS */}
            <div className="lg:col-span-7 xl:col-span-7 flex flex-col">
{/* COLUMNA CENTRO: TABLA DE POSICIONES */}
              
              {data.grupos && data.grupos.length > 0 ? (
                <div className="w-full flex flex-col gap-6">
                  {data.grupos.map((grupo: any, gIdx: number) => (
                    <section key={gIdx} className="w-full bg-gray-900 rounded-lg shadow-xl border border-gray-800 overflow-hidden self-start">
                      <div className="bg-gray-800/50 border-b border-gray-800 px-4 py-3">
                        <h2 className="text-gray-100 font-black uppercase text-sm tracking-widest">{grupo.name}</h2>
                      </div>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm text-gray-300">
                          <thead className="text-gray-400 font-semibold text-[11px] border-b border-gray-800">
                            <tr>
                              <th className="px-2 py-3 w-8 text-center">#</th>
                              <th className="px-2 py-3">Equipos</th>
                              <th className="px-1 py-3 text-center text-white">PTS</th>
                              <th className="px-1 py-3 text-center">J</th>
                              <th className="px-1 py-3 text-center">Gol</th>
                              <th className="px-1 py-3 text-center">+/-</th>
                              <th className="px-1 py-3 text-center">G</th>
                              <th className="px-1 py-3 text-center">E</th>
                              <th className="px-1 py-3 text-center">P</th>
                              <th className="px-2 py-3 text-center">Últimas</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-gray-800 font-medium bg-gray-900 text-gray-200">
                            {grupo.posiciones.map((team: any, idx: number) => (
                              <tr key={idx} className="hover:bg-gray-800/80 transition-colors">
                                <td className={`px-2 py-3 text-center font-bold text-xs ${getRowColor(liga, parseInt(team.rank) || idx + 1, grupo.posiciones.length)} border-r border-gray-800`}>
                                  {team.rank}
                                </td>
                                <td className="px-2 py-3 flex items-center gap-2 min-w-[120px]">
                                  {team.logo ? <img src={team.logo} className="w-5 h-5 object-contain" alt={team.team} /> : <div className="w-5 h-5 bg-gray-800 rounded"></div>}
                                  <span className="font-bold text-[13px] text-gray-100 leading-tight truncate">{team.team}</span>
                                </td>
                                <td className="px-1 py-3 text-center font-black text-white text-xs">{team.pts}</td>
                                <td className="px-1 py-3 text-center text-gray-400 text-xs">{team.pj}</td>
                                <td className="px-1 py-3 text-center text-gray-400 text-xs">{team.gol || "0:0"}</td>
                                <td className="px-1 py-3 text-center text-gray-400 text-xs">{team.dg}</td>
                                <td className="px-1 py-3 text-center text-gray-400 text-xs">{team.g || 0}</td>
                                <td className="px-1 py-3 text-center text-gray-400 text-xs">{team.e || 0}</td>
                                <td className="px-1 py-3 text-center text-gray-400 text-xs">{team.p || 0}</td>
                                <td className="px-2 py-3">
                                  <div className="flex items-center justify-center gap-1">
                                    {(team.ultimas || []).map((res: string, i: number) => (
                                      <span key={i} className={`flex items-center justify-center w-4 h-4 rounded-sm text-[9px] font-bold text-white ${res === 'V' ? 'bg-[#43a047]' : (res === 'E' ? 'bg-[#fdd835] text-black' : 'bg-[#e53935]')}`}>
                                        {res}
                                      </span>
                                    ))}
                                  </div>
                                </td>
                              </tr>
                            ))}
                            {grupo.posiciones.length === 0 && (
                              <tr><td colSpan={10} className="py-10 text-center text-gray-500 bg-gray-900">No hay tabla disponible</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                      {renderLegend(liga)}
                    </section>
                  ))}
                </div>
              ) : (
                <section className="w-full bg-gray-900 rounded-xl shadow-xl border border-gray-800 overflow-hidden self-start">
                  <div className="bg-gray-800/50 border-b border-gray-800 px-4 py-4 text-center">
                    <h2 className="text-gray-200 font-bold uppercase tracking-widest text-sm">Temporada Regular</h2>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-300">
                      <thead className="bg-gray-900 text-gray-400 uppercase font-semibold text-xs border-b border-gray-800">
                        <tr>
                          <th className="px-2 py-4 w-8 text-center">#</th>
                          <th className="px-2 py-4">Equipo</th>
                          <th className="px-1 py-4 text-center">Pts</th>
                          <th className="px-1 py-4 text-center">PJ</th>
                          <th className="px-1 py-4 text-center">DG</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-800 font-medium bg-gray-950 text-white">
                        {data.posiciones.map((team: any, idx: number) => (
                          <tr key={idx} className="hover:bg-gray-900 transition-colors">
                            <td className={`px-2 py-4 text-center font-bold text-sm ${idx < 4 ? 'text-emerald-500' : 'text-gray-400'}`}>
                              {team.rank}
                            </td>
                            <td className="px-2 py-4 flex items-center gap-2">
                              {team.logo ? <img src={team.logo} className="w-6 h-6 object-contain bg-white/90 p-[2px] rounded" alt={team.team} /> : <div className="w-6 h-6 bg-gray-800 rounded"></div>}
                              <span className="font-semibold text-sm text-gray-200 leading-tight">{team.team}</span>
                            </td>
                            <td className="px-1 py-4 text-center font-bold text-gray-100 text-sm">{team.pts}</td>
                            <td className="px-1 py-4 text-center text-gray-400 text-sm">{team.pj}</td>
                            <td className="px-1 py-4 text-center text-gray-400 text-sm">{team.dg}</td>
                          </tr>
                        ))}
                        {data.posiciones.length === 0 && (
                          <tr><td colSpan={5} className="py-10 text-center text-gray-500 bg-gray-950">No hay tabla disponible</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </section>
              )}


            {/* COLUMNA IZQUIERDA: ESTADÍSTICAS A LA PAR */}
            <aside className="w-full mt-8">
              {data.estadisticas && data.estadisticas.length > 0 && (
                <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl p-4 xl:p-5">
                  <h3 className="text-center text-gray-200 text-lg font-bold uppercase tracking-widest mb-6 border-b border-gray-800 pb-4">Estadísticas Personales</h3>
                  
                  {/* Grid de 2 columnas para poner Goles y Asistencias a la par */}
                  <div className="grid grid-cols-1 gap-6">
                    {data.estadisticas.map((statGroup: any, index: number) => {
                      const isExpanded = expandedStats[index];
                      // Mostrar 5 por defecto, o todos si está expandido
                      const visibleStats = isExpanded ? statGroup.top : statGroup.top.slice(0, 5);
                      
                      return (
                        <div key={index} className="border border-gray-800 rounded-lg overflow-hidden bg-gray-950 self-start">
                          <div className="bg-gray-800 text-gray-300 text-center py-3 text-xs font-bold uppercase tracking-wider">
                            {statGroup.categoria}
                          </div>
                          <div className="flex flex-col text-sm text-gray-300">
                            {visibleStats.map((jugador: any, idx: number) => (
                              <div key={idx} className="flex justify-between items-center px-3 py-4 border-b border-gray-800/50 hover:bg-gray-800 transition gap-2 xl:gap-3">
                                <div className="flex items-center gap-2 xl:gap-3 flex-1 min-w-0">
                                  <span className="text-gray-500 font-bold w-4 text-right text-[11px] xl:text-xs shrink-0">{idx + 1}</span>
                                  {jugador.logo_equipo ? (
                                    <img src={jugador.logo_equipo} className="w-5 h-5 rounded-full bg-white/90 p-[1px] shrink-0" />
                                  ) : (
                                    <div className="w-5 h-5 shrink-0"></div>
                                  )}
                                  <span className="text-[11px] xl:text-[12px] font-semibold text-gray-200 leading-tight line-clamp-2 flex-1">{jugador.jugador}</span>
                                </div>
                                <span className="font-bold text-gray-100 text-[11px] xl:text-xs bg-gray-800 px-1.5 xl:px-2 py-1 rounded-md shrink-0 ml-1">{jugador.valor}</span>
                              </div>
                            ))}
                          </div>
                          {statGroup.top.length > 5 && (
                            <button 
                              onClick={() => toggleStat(index)}
                              className="w-full py-3 text-xs font-semibold text-emerald-500 hover:text-emerald-400 bg-gray-950 hover:bg-gray-900 transition tracking-widest outline-none border-t border-gray-800"
                            >
                              {isExpanded ? 'Ver Menos ⌃' : 'Ver Todos ⌄'}
                            </button>
                          )}
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}
            </aside>

                        </div>

                        {/* COLUMNA DERECHA: PARTIDOS (TEMPORADA) */}
            <aside className="lg:col-span-5 xl:col-span-5 flex flex-col gap-6">
              <AdBanner dataAdSlot="clasificacion-top" />
              <div className="bg-gray-900 rounded-xl overflow-hidden border border-gray-800 shadow-xl relative">
                {loading && <div className="absolute inset-0 bg-gray-950/80 flex items-center justify-center z-10"><div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div></div>}
                
                <div className="text-center text-gray-200 py-4 bg-gray-800/50 border-b border-gray-800">
                  <h3 className="text-sm font-bold uppercase tracking-widest">Temporada</h3>
                </div>
                
                <div className="flex justify-between items-center px-4 py-3 bg-gray-900 text-gray-200 font-bold text-sm border-b border-gray-800">
                  <button disabled={jornada <= 1} onClick={() => setJornada(j => Math.max(1, j - 1))} className="text-emerald-500 hover:text-emerald-400 transition disabled:opacity-30 p-2 text-lg">◀</button>
                  <span className="uppercase tracking-widest text-sm">{data.jornada}</span>
                  <button disabled={jornada >= 38} onClick={() => setJornada(j => Math.min(38, j + 1))} className="text-emerald-500 hover:text-emerald-400 transition disabled:opacity-30 p-2 text-lg">▶</button>
                </div>
                
                  <div className="bg-gray-950 text-white flex flex-col font-medium overflow-y-auto overflow-x-hidden custom-scrollbar max-h-[850px] w-full">
                    {Object.entries(matchesByDate).map(([fecha, partidos]) => (
                      <div key={fecha} className="w-full">
                        <div className="w-full text-center py-2 bg-gray-900 border-y border-gray-700 text-xs text-gray-400 uppercase tracking-widest font-bold sticky top-0 z-10 shadow-sm">
                          {fecha}
                        </div>
                        {partidos.map((match: any) => (
                          <div key={match.id} className="grid grid-cols-[50px_1fr] items-center px-4 py-4 border-b border-gray-800 hover:bg-gray-900 transition-colors w-full gap-3">
                            <div className="text-gray-500 font-medium text-xs text-left">
                              {match.hora}
                            </div>
                            
                            <div className="flex items-center justify-center gap-3 min-w-0">
                              <span className="font-semibold text-gray-200 text-[11px] xl:text-xs text-right flex-1 break-words leading-tight">
                                {match.team_home}
                              </span>
                              {match.logo_home ? <img src={match.logo_home} className="w-5 h-5 sm:w-6 sm:h-6 object-contain bg-white/90 p-[1px] rounded-sm shrink-0 shadow-sm" /> : <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 rounded-sm shrink-0"></div>}
                              
                              <span className={`font-black text-[11px] xl:text-xs shrink-0 px-1 rounded ${match.estado === 'FINALIZADO' ? 'text-gray-200 bg-gray-800/80 border border-gray-700' : match.estado === 'EN CURSO' ? 'text-emerald-400' : 'text-gray-600'}`}>
                                {match.estado === 'PROGRAMADO' ? '-' : `${match.score_home} - ${match.score_away}`}
                              </span>
                              
                              {match.logo_away ? <img src={match.logo_away} className="w-5 h-5 sm:w-6 sm:h-6 object-contain bg-white/90 p-[1px] rounded-sm shrink-0 shadow-sm" /> : <div className="w-5 h-5 sm:w-6 sm:h-6 bg-gray-800 rounded-sm shrink-0"></div>}
                              <span className="font-semibold text-gray-200 text-[11px] xl:text-xs text-left flex-1 break-words leading-tight">
                                {match.team_away}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ))}
                    {Object.keys(matchesByDate).length === 0 && (
                      <div className="p-8 text-center text-gray-500 text-sm">Sin partidos</div>
                    )}
                  </div>
              </div>
            </aside>

          </div>
        </div>
      )}
    </div>
  );
}
