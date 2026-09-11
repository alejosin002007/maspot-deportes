'use client';
import { useState, useEffect } from "react";
import NewsCard from "@/components/NewsCard";

export default function Profile() {
  const [user, setUser] = useState<{nombre: string, foto_url?: string} | null>(null);
  const [nombreInput, setNombreInput] = useState("");
  const [fotoUrlInput, setFotoUrlInput] = useState("");
  const [mensaje, setMensaje] = useState({ text: "", type: "" });
  const [editando, setEditando] = useState(false);
  const [noticias, setNoticias] = useState([]);
  const [cargando, setCargando] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/login";
      return;
    }
    
    // Cargar usuario
    const userData = localStorage.getItem("user");
    if (userData) {
      try {
        const u = JSON.parse(userData);
        setUser(u);
        setNombreInput(u.nombre || "");
        setFotoUrlInput(u.foto_url || "");
      } catch (e) {}
    }

    // Cargar Favoritos
    const fetchFavoritos = async () => {
      try {
        const res = await fetch("https://maspot-deportes.onrender.com/api/favoritos", {
          headers: { "Authorization": `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          // Mapear las propiedades del backend a las que usa el NewsCard
          const mappedNews = data.noticias.map((n: any) => {
             const category = n.category || n.disciplina || "General";
             const defaultImg = `https://placehold.co/800x600/059669/ffffff?text=${encodeURIComponent(category)}`;
             return {
                id: n.id,
                title: n.title || n.titulo || "",
                category: category,
                time: n.time || n.fecha || "",
                link: n.link,
                img: n.imagen_url || n.img || defaultImg
             };
          });
          setNoticias(mappedNews);
        }
      } catch (err) {
        console.error(err);
      }
      setCargando(false);
    };
    fetchFavoritos();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const res = await fetch("https://maspot-deportes.onrender.com/api/auth/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify({ nombre: nombreInput, foto_url: fotoUrlInput }),
      });
      const data = await res.json();
      if (res.ok) {
        localStorage.setItem("user", JSON.stringify(data.user));
        setUser(data.user);
        setMensaje({ text: "¡Perfil actualizado!", type: "success" });
        setEditando(false);
      } else {
        setMensaje({ text: data.detail || "Error", type: "error" });
      }
    } catch (err) {
      setMensaje({ text: "Error de conexión", type: "error" });
    }
  };

  if (cargando) return <div className="p-10 text-center font-bold text-xl dark:text-white">Cargando tu perfil...</div>;

  return (
    <div className="p-8 space-y-12 max-w-7xl mx-auto">
      {/* Panel Superior: Usuario */}
      <div className="bg-white dark:bg-black rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-[#144a2d] flex flex-col md:flex-row items-center gap-8 relative overflow-hidden">
        
        {/* Avatar */}
        <div className="shrink-0">
          {user?.foto_url ? (
            <img src={user.foto_url} className="w-32 h-32 rounded-full object-cover shadow-lg border-4 border-emerald-500" />
          ) : (
            <div className="w-32 h-32 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-5xl shadow-lg border-4 border-emerald-200 dark:border-emerald-800">
              {user?.nombre?.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        {!editando ? (
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2">{user?.nombre}</h1>
            <p className="text-gray-500 dark:text-gray-400 mb-6">Administra tus datos y noticias guardadas desde aquí.</p>
            <button onClick={() => setEditando(true)} className="bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400 px-6 py-2 rounded-xl font-bold hover:bg-emerald-200 transition">
              Editar Perfil
            </button>
            {mensaje.text && <p className="mt-4 text-emerald-600 font-bold">{mensaje.text}</p>}
          </div>
        ) : (
          <form onSubmit={handleUpdate} className="flex-1 w-full space-y-4">
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">Nombre</label>
              <input type="text" required value={nombreInput} onChange={e => setNombreInput(e.target.value)} className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#071a10] text-gray-900 dark:text-white p-3 rounded-xl outline-none" />
            </div>
            <div>
              <label className="block text-sm font-bold mb-1 text-gray-700 dark:text-gray-300">URL de Foto</label>
              <input type="url" value={fotoUrlInput} onChange={e => setFotoUrlInput(e.target.value)} placeholder="https://ejemplo.com/mifoto.jpg" className="w-full border border-gray-300 dark:border-gray-600 bg-white dark:bg-[#071a10] text-gray-900 dark:text-white p-3 rounded-xl outline-none" />
            </div>
            <div className="flex gap-4">
              <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-700 transition">Guardar</button>
              <button type="button" onClick={() => setEditando(false)} className="text-gray-500 hover:text-gray-700 font-bold px-4">Cancelar</button>
            </div>
          </form>
        )}
      </div>

      {/* Panel Inferior: Favoritos */}
      <div>
        <h2 className="text-3xl font-black text-gray-900 dark:text-white mb-8 border-b border-gray-200 dark:border-[#144a2d] pb-4">
          ⭐ Mis Noticias Guardadas
        </h2>
        {noticias.length === 0 ? (
          <div className="text-center py-20 text-gray-500 dark:text-gray-400">
            No tienes ninguna noticia guardada en favoritos.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {noticias.map((item: any) => (
              <NewsCard key={item.id} item={item} defaultSaved={true} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
