import NewsCard from "@/components/NewsCard";
import AdBanner from "@/components/AdBanner";
import MatchSlider from "@/components/MatchSlider";
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
    teamA: m.team_home || m.teamA || (m.encuentro ? m.encuentro.split(" vs ")[0] : "Equipo A"),
    teamB: m.team_away || m.teamB || (m.encuentro ? m.encuentro.split(" vs ")[1] : "Equipo B"),
    logoA: m.logo_home || "",
    logoB: m.logo_away || "",
    score: m.score || m.resultado || "vs",
    status: m.status || m.estado || "",
    fecha: m.fecha || "",
    hora: m.hora || "",
    category: m.disciplina || m.category || ""
  }));

  const allNews = rawNews.map((n: any) => {
    const category = n.category || n.disciplina || "General";
    const catLower = category.toLowerCase();
    
    // Logos de respaldo 100% seguros sin bloqueos de hotlinking (CORS)
    const encodedCat = encodeURIComponent(category);
    const defaultImg = `https://placehold.co/800x600/059669/ffffff?text=${encodedCat}`;

    // Limpiar imǭgenes defectuosas de Google News
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

  // LÓGICA DE FILTRADO Y ORDEN INTERCALADO
  const matches = selectedCategory 
    ? allMatches.filter((m: any) => m.category.toLowerCase() === selectedCategory.toLowerCase())
    : allMatches;

  let news = [];
  if (selectedCategory) {
    news = allNews.filter((n: any) => n.category.toLowerCase() === selectedCategory.toLowerCase());
  } else {
    // Intercalar y priorizar ligas
    const groupedNews: Record<string, any[]> = {};
    allNews.forEach((n: any) => {
      if (!groupedNews[n.category]) groupedNews[n.category] = [];
      groupedNews[n.category].push(n);
    });
    
    const leagueOrder = ["Premier League", "La Liga", "Liga Argentina", "Serie A", "Bundesliga", "Ligue 1", "Internacional", "Brasileirao", "Primeira Liga", "MLS", "Eredivisie"];
    
    let added = true;
    while(added) {
       added = false;
       // Primero recorremos la lista prioritaria
       for (const league of leagueOrder) {
          if (groupedNews[league] && groupedNews[league].length > 0) {
              news.push(groupedNews[league].shift());
              added = true;
          }
       }
       // Luego cualquier otra liga que haya quedado
       for (const league in groupedNews) {
          if (!leagueOrder.includes(league) && groupedNews[league].length > 0) {
              news.push(groupedNews[league].shift());
              added = true;
          }
       }
    }
  }

  return (
    <div className="space-y-16">
      {/* Resultados y Slider Interactivo */}
      <MatchSlider initialMatches={allMatches} selectedCategory={selectedCategory} />

      {/* Grid de Noticias */}
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
