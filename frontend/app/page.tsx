import NewsCard from "@/components/NewsCard";

export const dynamic = 'force-dynamic';

export default async function Home({ searchParams }: { searchParams: { disciplina?: string, q?: string } }) {
  // Función helper para fetchear datos con fallback
  async function fetchBackend(endpoint: string, fallbackData: any) {
    try {
      const res = await fetch(`http://127.0.0.1:8000/api/${endpoint}`, { cache: 'no-store' });
      if (!res.ok) return fallbackData;
      return await res.json();
    } catch (e) {
      // Backend no está corriendo, devolvemos fallback
      return fallbackData;
    }
  }

  const fallbackMatches = [
    { id: 1, teamA: "Real Madrid", teamB: "Barcelona", time: "16:00", score: "2 - 1", status: "Finalizado", disciplina: "Fútbol" }
  ];

  const fallbackNews = [
    { id: 1, title: "Backend no conectado", category: "Sistema", time: "Hace 1 hora", img: "https://via.placeholder.com/400x200?text=Sistema" },
  ];

  const selectedCategory = searchParams.disciplina;
  const searchQuery = searchParams.q;

  // Construir la URL de noticias con parámetros
  let noticiasUrl = 'noticias?';
  if (selectedCategory) noticiasUrl += `disciplina=${encodeURIComponent(selectedCategory)}&`;
  if (searchQuery) noticiasUrl += `q=${encodeURIComponent(searchQuery)}&`;

  const rawMatches = await fetchBackend('resultados', fallbackMatches);
  const rawNews = await fetchBackend(noticiasUrl, fallbackNews);

  // Normalizamos las propiedades porque el backend las envía en español (titulo, encuentro, resultado) 
  // y nuestro componente UI las espera en inglés (title, teamA, teamB, score)
  const allMatches = rawMatches.map((m: any) => ({
    id: m.id,
    teamA: m.teamA || (m.encuentro ? m.encuentro.split(" vs ")[0] : "Equipo A"),
    teamB: m.teamB || (m.encuentro ? m.encuentro.split(" vs ")[1] : "Equipo B"),
    score: m.score || m.resultado || "vs",
    status: m.status || m.estado || "",
    time: m.time || m.fecha || "Hoy",
    category: m.disciplina || m.category || ""
  }));

  const allNews = rawNews.map((n: any) => {
    const category = n.category || n.disciplina || "General";
    const catLower = category.toLowerCase();
    
    // Si la fuente RSS no trae imagen original, usamos loremflickr para inyectar una aleatoria (pero fija por id)
    let keyword = "sports";
    if (catLower.includes("hockey")) keyword = "fieldhockey";
    else if (catLower.includes("rugby")) keyword = "rugby";
    else if (catLower.includes("básquet") || catLower.includes("nba")) keyword = "basketball";
    else if (catLower.includes("tenis")) keyword = "tennis";
    else if (catLower.includes("fórmula") || catLower.includes("motor")) keyword = "formula1";
    else if (catLower.includes("fútbol")) keyword = "soccer";

    // Usamos el ID de la noticia para que siempre cargue la misma foto para la misma noticia
    const defaultImg = `https://loremflickr.com/800/600/${keyword},sport?lock=${n.id || Math.floor(Math.random() * 100)}`;

    return {
      id: n.id,
      title: n.title || n.titulo || "Sin título",
      category: category,
      time: n.time || n.fecha || "",
      link: n.link,
      img: n.imagen_url || n.img || defaultImg
    };
  });

  // LÓGICA DE FILTRADO
  const matches = selectedCategory 
    ? allMatches.filter((m: any) => m.category.toLowerCase() === selectedCategory.toLowerCase())
    : allMatches;

  const news = selectedCategory
    ? allNews.filter((n: any) => n.category.toLowerCase() === selectedCategory.toLowerCase())
    : allNews;

  return (
    <div className="space-y-16">
      {/* Resultados */}
      <section>
        <h2 className="text-2xl font-bold mb-8 dark:text-white">Resultados y Próximos Partidos</h2>
        <div className="flex space-x-6 overflow-x-auto pb-4 custom-scrollbar">
          {matches.map((match: any) => (
            <div key={match.id} className="min-w-[280px] bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700 shrink-0">
              <div className="text-xs text-gray-500 dark:text-gray-400 mb-3 font-bold uppercase tracking-widest">{match.status} • {match.time}</div>
              <div className="flex justify-between items-center mb-3">
                <span className="font-semibold text-lg dark:text-white">{match.teamA}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-lg dark:text-white">{match.teamB}</span>
                <span className="text-2xl font-black text-blue-600 dark:text-blue-400">{match.score || 'vs'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grilla de Noticias */}
      <section>
        <h2 className="text-2xl font-bold mb-8 dark:text-white">Últimas Noticias</h2>
        {news.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {news.map((item: any) => (
              <NewsCard key={item.id} item={item} />
            ))}
          </div>
        ) : (
          <div className="w-full py-16 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No se encontraron noticias</h3>
            <p className="text-gray-400 dark:text-gray-500">Intenta buscar otra palabra o selecciona otra categoría.</p>
          </div>
        )}
      </section>
    </div>
  );
}
