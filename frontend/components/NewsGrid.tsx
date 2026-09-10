"use client";
import React, { useState } from "react";
import NewsCard from "./NewsCard";
import AdBanner from "./AdBanner";

export default function NewsGrid({ initialNews }: { initialNews: any[] }) {
  const [visibleCount, setVisibleCount] = useState(15);

  const loadMore = () => {
    setVisibleCount(prev => prev + 15);
  };

  const visibleNews = initialNews.slice(0, visibleCount);
  const hasMore = visibleCount < initialNews.length;

  return (
    <div className="flex flex-col gap-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-6">
        {visibleNews.map((item: any, index: number) => (
          <React.Fragment key={item.id}>
            {index > 0 && index % 6 === 3 && (
              <AdBanner dataAdSlot={`banner-${index}`} />
            )}
            <NewsCard item={item} />
          </React.Fragment>
        ))}
      </div>
      
      {hasMore && (
        <div className="flex justify-center w-full mt-4">
          <button 
            onClick={loadMore}
            className="bg-gray-900 dark:bg-black text-white dark:text-gray-200 px-8 py-3 rounded-full font-bold hover:bg-emerald-600 dark:hover:bg-emerald-600 transition-colors shadow-lg hover:shadow-xl"
          >
            Cargar más noticias
          </button>
        </div>
      )}
    </div>
  );
}
