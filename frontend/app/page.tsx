import NewsCard from "@/components/NewsCard";
import AdBanner from "@/components/AdBanner";
import React from "react";

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
    
    // Logos oficiales de las ligas como respaldo
    const categoryLogos: Record<string, string> = {
        "La Liga": "https://upload.wikimedia.org/wikipedia/commons/thumb/0/0f/LaLiga_logo_2023.svg/1024px-LaLiga_logo_2023.svg.png",
        "Premier League": "https://upload.wikimedia.org/wikipedia/en/thumb/f/f2/Premier_League_Logo.svg/1200px-Premier_League_Logo.svg.png",
        "Serie A": "https://upload.wikimedia.org/wikipedia/en/thumb/e/e1/Serie_A_logo_%282022%29.svg/1200px-Serie_A_logo_%282022%29.svg.png",
        "Bundesliga": "https://upload.wikimedia.org/wikipedia/en/thumb/d/df/Bundesliga_logo_%282017%29.svg/1200px-Bundesliga_logo_%282017%29.svg.png",
        "Ligue 1": "https://upload.wikimedia.org/wikipedia/en/thumb/b/ba/Ligue_1_Uber_Eats.svg/1200px-Ligue_1_Uber_Eats.svg.png",
        "Liga Argentina": "https://upload.wikimedia.org/wikipedia/en/thumb/e/ed/AFA_logo.svg/1200px-AFA_logo.svg.png",
        "Brasileirao": "https://upload.wikimedia.org/wikipedia/en/thumb/4/42/Campeonato_Brasileiro_S%C3%A9rie_A_logo.png/1200px-Campeonato_Brasileiro_S%C3%A9rie_A_logo.png",
        "Liga MX": "https://upload.wikimedia.org/wikipedia/en/thumb/c/cb/Liga_MX.svg/1200px-Liga_MX.svg.png",
        "MLS": "https://upload.wikimedia.org/wikipedia/commons/thumb/7/76/MLS_crest_logo_RGB_gradient.svg/1200px-MLS_crest_logo_RGB_gradient.svg.png",
    };
    const defaultImg = categoryLogos[category] || `https://placehold.co/800x600/059669/ffffff?text=Maspot+Futbol`;

    // Limpiar imágenes defectuosas de Google News
    let finalImg = n.imagen_url || n.img || defaultImg;
    if (finalImg && (finalImg.includes("googleusercontent") || finalImg.includes("gstatic") || finalImg.includes("news.google.com") || finalImg === "https://news.google.com/rss")) {
        finalImg = defaultImg;
    }

    return {
      id: n.id,
      title: n.title || n.titulo || "",
      category: category,
      time: n.time || n.fecha || "",
      link: n.link,
      img: finalImg
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
                <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{match.score || 'vs'}</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Grilla de Noticias */}
      <section>
        <h2 className="text-2xl font-bold mb-8 dark:text-white">Últimas Noticias</h2>
        {news.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
            {news.map((item: any, index: number) => (
              <React.Fragment key={item.id}>
                {/* Inyectar un anuncio cada 6 noticias, comenzando después de la 3ra */}
                {index > 0 && index % 6 === 3 && (
                  <AdBanner dataAdSlot={`banner-${index}`} />
                )}
                <NewsCard item={item} />
              </React.Fragment>
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
