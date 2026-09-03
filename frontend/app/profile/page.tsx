"use client";

import { useEffect, useState } from "react";
import NewsCard from "@/components/NewsCard";

export default function ProfilePage() {
  const [user, setUser] = useState<{ nombre: string, email: string } | null>(null);
  const [favs, setFavs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState<string | null>(null);

  // Estados para cambio de contraseña
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [passwordMsg, setPasswordMsg] = useState("");

  useEffect(() => {
    const t = localStorage.getItem("token");
    const userData = localStorage.getItem("user");
    
    if (userData) {
      setUser(JSON.parse(userData));
    } else {
      window.location.href = "/login";
    }

    if (t) {
      setToken(t);
      fetch("http://127.0.0.1:8000/api/favoritos", {
        headers: { Authorization: `Bearer ${t}` }
      })
      .then(r => r.json())
      .then(data => {
        if (data.noticias) {
          const normalized = data.noticias.map((n: any) => {
            const catLower = n.disciplina.toLowerCase();
            let keyword = "sports";
            if (catLower.includes("hockey")) keyword = "fieldhockey";
            else if (catLower.includes("rugby")) keyword = "rugby";
            else if (catLower.includes("básquet") || catLower.includes("nba")) keyword = "basketball";
            else if (catLower.includes("tenis")) keyword = "tennis";
            else if (catLower.includes("fórmula") || catLower.includes("motor")) keyword = "formula1";
            else if (catLower.includes("fútbol")) keyword = "soccer";
            const defaultImg = `https://loremflickr.com/800/600/${keyword},sport?lock=${n.id}`;

            return {
              id: n.id,
              title: n.titulo,
              category: n.disciplina,
              time: n.fecha,
              link: n.link,
              img: n.imagen_url || defaultImg
            };
          });
          setFavs(normalized);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
    }
  }, []);

  const handleChangePassword = async (e: any) => {
    e.preventDefault();
    setPasswordMsg("Cambiando...");
    try {
      const res = await fetch("http://127.0.0.1:8000/api/auth/change-password", {
        method: "POST",
        headers: { 
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ old_password: oldPassword, new_password: newPassword })
      });
      const data = await res.json();
      if (res.ok) {
        setPasswordMsg("¡Contraseña actualizada con éxito!");
        setTimeout(() => {
          setIsChangingPassword(false);
          setOldPassword("");
          setNewPassword("");
          setPasswordMsg("");
        }, 2000);
      } else {
        setPasswordMsg(data.detail || "Error al cambiar contraseña");
      }
    } catch (err) {
      setPasswordMsg("Error de conexión");
    }
  };

  if (!user) return null;

  const initial = user.nombre.charAt(0).toUpperCase();

  return (
    <div className="max-w-5xl mx-auto space-y-12">
      <section className="bg-white dark:bg-gray-800 p-8 rounded-3xl shadow-sm border border-gray-200 dark:border-gray-700 flex flex-col md:flex-row gap-8 items-start md:items-center">
        <div className="w-32 h-32 bg-blue-600 rounded-full flex items-center justify-center text-white font-black text-6xl shadow-xl border-4 border-blue-200 dark:border-blue-900 shrink-0">
          {initial}
        </div>
        <div className="flex-1 space-y-4 w-full">
          <div>
            <h1 className="text-3xl font-black text-gray-900 dark:text-white mb-1">Perfil de Usuario</h1>
            <p className="text-gray-500 dark:text-gray-400">Gestiona tu información personal</p>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Nombre</label>
              <div className="text-lg font-semibold dark:text-gray-200">{user.nombre}</div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-100 dark:border-gray-700">
              <label className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1 block">Email</label>
              <div className="text-lg font-semibold dark:text-gray-200">{user.email || "usuario@ejemplo.com"}</div>
            </div>
          </div>
          
          <div className="pt-2">
            {!isChangingPassword ? (
              <button onClick={() => setIsChangingPassword(true)} className="px-6 py-3 bg-gray-900 dark:bg-gray-700 text-white font-bold rounded-xl hover:bg-gray-800 dark:hover:bg-gray-600 transition shadow-sm">
                Cambiar Contraseña
              </button>
            ) : (
              <form onSubmit={handleChangePassword} className="bg-gray-50 dark:bg-gray-900 p-4 rounded-xl border border-gray-200 dark:border-gray-700 space-y-3 max-w-sm">
                <input 
                  type="password" 
                  placeholder="Contraseña actual" 
                  required
                  value={oldPassword}
                  onChange={(e) => setOldPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                />
                <input 
                  type="password" 
                  placeholder="Nueva contraseña" 
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className="w-full px-3 py-2 border rounded dark:bg-gray-800 dark:border-gray-600 dark:text-white" 
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-blue-600 text-white py-2 rounded font-bold hover:bg-blue-700">Confirmar</button>
                  <button type="button" onClick={() => setIsChangingPassword(false)} className="flex-1 bg-gray-300 dark:bg-gray-700 text-black dark:text-white py-2 rounded font-bold hover:bg-gray-400 dark:hover:bg-gray-600">Cancelar</button>
                </div>
                {passwordMsg && <p className="text-sm text-center font-semibold text-blue-600 dark:text-blue-400">{passwordMsg}</p>}
              </form>
            )}
          </div>
        </div>
      </section>

      <section>
        <div className="flex items-center gap-3 mb-8">
          <svg className="w-8 h-8 text-yellow-500" fill="currentColor" viewBox="0 0 24 24"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg>
          <h2 className="text-2xl font-bold dark:text-white">Mis Noticias Guardadas</h2>
        </div>
        
        {loading ? (
          <div className="flex justify-center p-12">
            <div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : favs.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
            {favs.map((item: any) => (
              <NewsCard key={item.id} item={item} defaultSaved={true} />
            ))}
          </div>
        ) : (
          <div className="w-full py-16 flex flex-col items-center justify-center bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-200 dark:border-gray-700">
            <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">No tienes noticias guardadas</h3>
            <p className="text-gray-400 dark:text-gray-500">Haz clic en la estrella de cualquier noticia para guardarla aquí.</p>
          </div>
        )}
      </section>
    </div>
  );
}
