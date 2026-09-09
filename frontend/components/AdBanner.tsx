"use client";
import { useEffect, useState } from "react";

export default function AdBanner({ dataAdSlot }: { dataAdSlot: string }) {
  const [adLoaded, setAdLoaded] = useState(false);

  useEffect(() => {
    try {
      // Intento cargar AdSense real
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
      setAdLoaded(true);
    } catch (err) {
      console.error("Error cargando el anuncio de AdSense:", err);
    }
  }, []);

  // Lista de anuncios de prueba mockeados (marcas deportivas, apuestas, etc)
  const mockAds = [
    { brand: "Nike", title: "Nuevos Mercurial Vapor", desc: "Velocidad explosiva.", img: "https://images.unsplash.com/photo-1608248543803-ba4f8c70ae0b?auto=format&fit=crop&w=400&q=80", color: "bg-orange-500" },
    { brand: "Adidas", title: "Predator Accuracy", desc: "Control total del balón.", img: "https://images.unsplash.com/photo-1511886929837-354d827aae26?auto=format&fit=crop&w=400&q=80", color: "bg-blue-600" },
    { brand: "Puma", title: "Future Ultimate", desc: "Agilidad sin límites.", img: "https://images.unsplash.com/photo-1577223625816-7546f13df25d?auto=format&fit=crop&w=400&q=80", color: "bg-emerald-500" }
  ];

  // Elegir un anuncio al azar basado en el id del slot (para que sea pseudo-aleatorio pero estable)
  const adIndex = parseInt(dataAdSlot.split('-')[1] || "0") % mockAds.length;
  const ad = mockAds[adIndex];

  return (
    <div className="w-full h-full min-h-[300px] bg-gray-900 rounded-2xl flex flex-col items-center justify-center border-2 border-transparent hover:border-gray-500 transition overflow-hidden relative group cursor-pointer shadow-md hover:shadow-xl">
      <span className="absolute top-3 right-3 text-[9px] uppercase font-bold text-white/50 bg-black/40 px-2 py-1 rounded z-20">Publicidad</span>
      
      {/* Imagen de fondo del anuncio simulado */}
      <div className="absolute inset-0 w-full h-full z-0">
        <img src={ad.img} alt={ad.brand} className="w-full h-full object-cover opacity-60 group-hover:scale-105 transition duration-500" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent"></div>
      </div>

      {/* Contenido del anuncio simulado */}
      <div className="relative z-10 p-6 flex flex-col justify-end h-full w-full text-center mt-auto">
        <span className={`text-xs font-black uppercase tracking-widest text-white mb-2 mx-auto px-3 py-1 rounded-full ${ad.color}`}>
          {ad.brand}
        </span>
        <h3 className="text-xl font-black text-white leading-tight mb-2 drop-shadow-md">
          {ad.title}
        </h3>
        <p className="text-sm text-gray-300 font-medium mb-4 drop-shadow-md">
          {ad.desc}
        </p>
        <button className="bg-white text-gray-900 font-bold text-sm py-2 px-6 rounded-full hover:bg-gray-200 transition shadow-lg w-fit mx-auto">
          Comprar Ahora
        </button>
      </div>

      {/* Etiqueta real de Google AdSense (oculta si estamos mostrando el mock) */}
      <div className="hidden">
        <ins
          className="adsbygoogle"
          style={{ display: "block" }}
          data-ad-client="ca-pub-0000000000000000"
          data-ad-slot={dataAdSlot}
          data-ad-format="auto"
          data-full-width-responsive="true"
        ></ins>
      </div>
    </div>
  );
}
