"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

export default function UserAvatar() {
  const [user, setUser] = useState<{ nombre: string, foto_url?: string } | null>(null);

  useEffect(() => {
    const userData = localStorage.getItem("user");
    if (userData) {
      try { setUser(JSON.parse(userData)); } catch (e) {}
    }
  }, []);

  if (!user) {
    return (
      <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center text-gray-400">
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
          <path fillRule="evenodd" d="M7.5 6a4.5 4.5 0 1 1 9 0 4.5 4.5 0 0 1-9 0ZM3.751 20.105a8.25 8.25 0 0 1 16.498 0 .75.75 0 0 1-.437.695A18.683 18.683 0 0 1 12 22.5c-2.786 0-5.433-.608-7.812-1.7a.75.75 0 0 1-.437-.695Z" clipRule="evenodd" />
        </svg>
      </div>
    );
  }

  // Let's generate a fun avatar based on their name!
  const initial = user.nombre.charAt(0).toUpperCase();

  return (
    <Link href="/profile" className="flex items-center gap-3 hover:opacity-80 transition cursor-pointer">
      <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.nombre}</span>
      {user.foto_url ? (
        <img src={user.foto_url} alt={user.nombre} className="w-10 h-10 rounded-full object-cover shadow-sm border-2 border-emerald-200 dark:border-emerald-800" />
      ) : (
        <div className="w-10 h-10 bg-emerald-600 rounded-full flex items-center justify-center text-white font-bold text-lg shadow-sm border-2 border-emerald-200 dark:border-emerald-800">
          {initial}
        </div>
      )}
    </Link>
  );
}
