"use client";
import { useEffect } from "react";

export default function AdBanner({ dataAdSlot }: { dataAdSlot: string }) {
  useEffect(() => {
    try {
      // Le dice a Google que inyecte el anuncio en este espacio
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Error cargando el anuncio de AdSense:", err);
    }
  }, []);

  return (
    <div className="w-full h-full min-h-[250px] bg-gray-50 dark:bg-gray-800/50 rounded-xl flex flex-col items-center justify-center border border-dashed border-gray-300 dark:border-gray-600 overflow-hidden relative">
      <span className="absolute top-2 left-2 text-[10px] uppercase font-bold text-gray-400">Publicidad</span>
      
      {/* Etiqueta real de Google AdSense */}
      <ins
        className="adsbygoogle w-full h-full flex justify-center items-center"
        style={{ display: "block", minHeight: "250px" }}
        data-ad-client="ca-pub-0000000000000000" // <-- Reemplazar por tu ID de AdSense
        data-ad-slot={dataAdSlot}               // <-- Reemplazar por el ID de tu bloque de anuncios
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
