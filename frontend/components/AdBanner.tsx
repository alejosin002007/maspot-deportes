"use client";
import { useEffect } from "react";

export default function AdBanner({ dataAdSlot }: { dataAdSlot: string }) {
  useEffect(() => {
    try {
      // @ts-ignore
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (err) {
      console.error("Error cargando el anuncio de AdSense:", err);
    }
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] bg-gray-100 dark:bg-gray-900 rounded-2xl flex flex-col items-center justify-center border border-gray-200 dark:border-gray-800 overflow-hidden relative shadow-sm">
      <span className="absolute top-2 right-2 text-[9px] uppercase font-bold text-gray-400">Publicidad</span>
      
      {/* Etiqueta real de Google AdSense */}
      <ins
        className="adsbygoogle"
        style={{ display: "block", width: "100%", height: "100%" }}
        data-ad-client="ca-pub-8662542322334638"
        data-ad-slot={dataAdSlot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      ></ins>
    </div>
  );
}
