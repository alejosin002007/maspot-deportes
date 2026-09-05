from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from database import engine, get_db, Base
import models
from tasks.feed_ingester import ingest_espn_feed
from routers import auth, favoritos

app = FastAPI(title="Maspot Deportes API")

# Registrar rutas de autenticación
app.include_router(auth.router)
app.include_router(favoritos.router)

# Configurar middleware de CORS para permitir solicitudes desde Next.js (localhost:3000)
origins = [
    "http://localhost",
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Inicializar Base de Datos (crea las tablas si no existen)
Base.metadata.create_all(bind=engine)

import asyncio
from database import SessionLocal

async def periodic_news_update():
    # Esperar 5 segundos al inicio para permitir que FastAPI termine de arrancar
    await asyncio.sleep(5)
    while True:
        try:
            print("[CRON] Ejecutando actualización automática de noticias (cada 15 minutos)...")
            # Usar un hilo separado para que no bloquee las peticiones de los usuarios
            db = SessionLocal()
            nuevas = await asyncio.to_thread(ingest_espn_feed, db)
            print(f"[CRON] Éxito: {nuevas} noticias nuevas guardadas en la base de datos.")
            db.close()
        except Exception as e:
            print(f"[CRON] Error al actualizar noticias: {e}")
        
        # Esperar 15 minutos (15 * 60 = 900 segundos)
        await asyncio.sleep(900)

@app.on_event("startup")
async def startup_event():
    # Inicia la tarea de actualización en segundo plano cuando arranca el servidor
    asyncio.create_task(periodic_news_update())

@app.get("/api/refresh")
def refresh_news(db: Session = Depends(get_db)):
    """
    Endpoint manual para leer el RSS y guardarlo en la Base de Datos.
    """
    try:
        nuevas = ingest_espn_feed(db)
        return {"status": "ok", "mensaje": f"Se agregaron {nuevas} noticias nuevas a la DB."}
    except Exception as e:
        return {"status": "error", "mensaje": str(e)}

from typing import Optional

@app.get("/api/noticias")
def obtener_noticias(q: Optional[str] = None, disciplina: Optional[str] = None, db: Session = Depends(get_db)):
    """
    Retorna noticias mezcladas algorítmicamente.
    """
    query = db.query(models.Noticia)
    
    if disciplina:
        query = query.filter(models.Noticia.disciplina == disciplina)
    if q:
        query = query.filter((models.Noticia.titulo.ilike(f"%{q}%")) | (models.Noticia.resumen.ilike(f"%{q}%")))
        
    noticias_db = query.order_by(models.Noticia.id.desc()).limit(150).all()
    
    if not disciplina and not q:
        grupos = { "Fútbol": [], "Básquetbol": [], "Fórmula 1": [], "Tenis": [], "Hockey": [], "Rugby": [] }
        otros = []
        for n in noticias_db:
            if n.disciplina in grupos:
                grupos[n.disciplina].append(n)
            else:
                otros.append(n)
                
        mezcla = []
        while any(grupos.values()) or otros:
            for _ in range(4):
                if grupos["Fútbol"]: mezcla.append(grupos["Fútbol"].pop(0))
            for _ in range(2):
                if grupos["Básquetbol"]: mezcla.append(grupos["Básquetbol"].pop(0))
                if grupos["Fórmula 1"]: mezcla.append(grupos["Fórmula 1"].pop(0))
                if grupos["Tenis"]: mezcla.append(grupos["Tenis"].pop(0))
            if grupos["Hockey"]: mezcla.append(grupos["Hockey"].pop(0))
            if grupos["Rugby"]: mezcla.append(grupos["Rugby"].pop(0))
            if otros: mezcla.append(otros.pop(0))
            
            # Romper si solo queda 'otros' o todo vacío
            if not any(grupos.values()):
                mezcla.extend(otros)
                break
        noticias_db = mezcla[:36]
    else:
        noticias_db = noticias_db[:36]

    formatted_news = []
    for n in noticias_db:
        formatted_news.append({
            "id": n.id,
            "titulo": n.titulo,
            "disciplina": n.disciplina,
            "fecha": n.fecha,
            "link": n.link,
            "imagen_url": n.imagen_url
        })
    return formatted_news

@app.get("/api/resultados")
def obtener_resultados():
    """
    Retorna datos mock de resultados deportivos.
    """
    return [
        {
            "id": 101,
            "encuentro": "Argentina vs Brasil",
            "resultado": "2 - 1",
            "estado": "Finalizado",
            "disciplina": "Fútbol"
        },
        {
            "id": 102,
            "encuentro": "Alcaraz vs Sinner",
            "resultado": "3 - 2 (Sets)",
            "estado": "Finalizado",
            "disciplina": "Tenis"
        },
        {
            "id": 103,
            "encuentro": "Lakers vs Warriors",
            "resultado": "112 - 108",
            "estado": "Finalizado",
            "disciplina": "Básquetbol"
        }
    ]
