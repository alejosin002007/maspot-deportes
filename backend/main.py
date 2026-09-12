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
    "https://maspot-deportes.vercel.app",
    "*"
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

@app.get("/api/clear-news")
def clear_news(db: Session = Depends(get_db)):
    count = db.query(models.Noticia).delete()
    db.commit()
    return {"status": "ok", "deleted": count}

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
        
    noticias_db = query.order_by(models.Noticia.id.desc()).limit(600).all()
    
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
        noticias_db = mezcla[:150]
    else:
        noticias_db = noticias_db[:150]

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

import requests

import httpx
import asyncio

async def fetch_league(client, league_code, nombre_liga):
    url = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{league_code}/scoreboard"
    try:
        resp = await client.get(url, timeout=5)
        if resp.status_code == 200:
            return nombre_liga, resp.json()
    except Exception:
        pass
    return nombre_liga, None

@app.get("/api/resultados")
async def obtener_resultados():
    """
    Retorna resultados deportivos REALES y en VIVO (Fútbol) usando la API pública de ESPN, 
    consultando ligas específicas concurrentemente.
    """
    leagues_to_fetch = [
        ("eng.1", "Premier League"),
        ("esp.1", "La Liga"),
        ("arg.1", "Liga Argentina"),
        ("ita.1", "Serie A"),
        ("ger.1", "Bundesliga"),
        ("fra.1", "Ligue 1"),
        ("bra.1", "Brasileirao"),
        ("por.1", "Primeira Liga"),
        ("usa.1", "MLS"),
        ("ned.1", "Eredivisie"),
        ("uefa.champions", "Champions League"),
        ("uefa.europa", "Europa League"),
        ("conmebol.libertadores", "Copa Libertadores"),
        ("conmebol.sudamericana", "Copa Sudamericana")
    ]
    
    resultados = []
    
    try:
        async with httpx.AsyncClient() as client:
            tasks = [fetch_league(client, code, name) for code, name in leagues_to_fetch]
            responses = await asyncio.gather(*tasks)
            
            for nombre_liga, data in responses:
                if not data: continue
                events = data.get("events", [])
                # Traer hasta 10 partidos por liga para no saturar
                for ev in events[:10]:
                    comp = ev['competitions'][0]
                    
                    # Extraer equipos y logos
                    team_home = comp['competitors'][0]['team']['shortDisplayName']
                    logo_home = comp['competitors'][0]['team'].get('logo', '')
                    score_home = comp['competitors'][0].get('score', '0')
                    
                    team_away = comp['competitors'][1]['team']['shortDisplayName']
                    logo_away = comp['competitors'][1]['team'].get('logo', '')
                    score_away = comp['competitors'][1].get('score', '0')
                    
                    estado_raw = ev['status']['type']['description']
                    if "Full" in estado_raw or "Final" in estado_raw:
                        estado = "FINALIZADO"
                    elif "Half" in estado_raw:
                        estado = "ENTRETIEMPO"
                    elif "Scheduled" in estado_raw or "Postponed" in estado_raw:
                        estado = "PROGRAMADO"
                    else:
                        estado = "EN CURSO"
                    
                    # Manejar fecha y hora
                    raw_date = ev.get('date', '')
                    fecha_formateada = ""
                    hora_formateada = ""
                    if raw_date:
                        try:
                            from datetime import datetime, timedelta
                            dt = datetime.strptime(raw_date, "%Y-%m-%dT%H:%MZ")
                            # Ajuste de zona horaria a Argentina (UTC-3)
                            dt_local = dt - timedelta(hours=3)
                            fecha_formateada = dt_local.strftime("%d/%m/%Y")
                            hora_formateada = dt_local.strftime("%H:%M")
                        except:
                            pass
                    
                    resultados.append({
                        "id": ev["id"],
                        "encuentro": f"{team_home} vs {team_away}",
                        "team_home": team_home,
                        "team_away": team_away,
                        "logo_home": logo_home,
                        "logo_away": logo_away,
                        "resultado": f"{score_home} - {score_away}",
                        "estado": estado,
                        "fecha": fecha_formateada,
                        "hora": hora_formateada,
                        "disciplina": nombre_liga
                    })
        
        if resultados:
            return resultados
    except Exception as e:
        print(f"Error fetching live scores concurrently: {e}")

    # Fallback si falla el internet
    return [
        {
            "id": 101,
            "encuentro": "Real Madrid vs Barcelona",
            "team_home": "Real Madrid",
            "team_away": "Barcelona",
            "logo_home": "https://a.espncdn.com/i/teamlogos/soccer/500/86.png",
            "logo_away": "https://a.espncdn.com/i/teamlogos/soccer/500/83.png",
            "resultado": "2 - 1",
            "estado": "FINALIZADO",
            "fecha": "",
            "hora": "",
            "disciplina": "La Liga"
        }
    ]


@app.get("/api/clasificacion")
async def obtener_clasificacion(liga: str = "eng.1", jornada: int = 0):
    url_standings = f"https://site.api.espn.com/apis/v2/sports/soccer/{liga}/standings"
    if liga in ["arg.1", "bra.1", "usa.1", "conmebol.libertadores", "conmebol.sudamericana"]:
        url_scoreboard = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{liga}/scoreboard?dates=20260101-20261231&limit=450"
    else:
        url_scoreboard = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{liga}/scoreboard?dates=20260701-20270630&limit=450"
    url_stats = f"https://site.api.espn.com/apis/site/v2/sports/soccer/{liga}/statistics"
    
    posiciones = []
    grupos = []
    partidos = []
    estadisticas = []
    jornada_actual = 0
    total_jornadas = 38
    matches_per_jornada = 10
    
    if "arg" in liga or "mls" in liga: total_jornadas = 27
    if "ger" in liga: total_jornadas = 34
    
    try:
        async with httpx.AsyncClient() as client:
            res_std, res_scb, res_sts = await asyncio.gather(
                client.get(url_standings, timeout=10),
                client.get(url_scoreboard, timeout=10),
                client.get(url_stats, timeout=10),
                return_exceptions=True
            )
            
            real_form = {}
            events_data = []
            if isinstance(res_scb, httpx.Response) and res_scb.status_code == 200:
                data_scb = res_scb.json()
                events = data_scb.get("events", [])
                if events:
                    target_slug = None
                    for e in events:
                        if e.get("status", {}).get("type", {}).get("state") in ["in", "pre"]:
                            target_slug = e.get("season", {}).get("slug")
                            break
                    if not target_slug and len(events) > 0:
                        target_slug = events[-1].get("season", {}).get("slug")
                    if target_slug:
                        events = [e for e in events if e.get("season", {}).get("slug") == target_slug]
                        
                    events_data = sorted(events, key=lambda x: x.get("date", ""))
                    for ev in events_data:
                        if ev.get("status", {}).get("type", {}).get("state") == "post":
                            comp = ev.get("competitions", [{}])[0]
                            competitors = comp.get("competitors", [])
                            if len(competitors) == 2:
                                c1, c2 = competitors[0], competitors[1]
                                t1_id = c1.get("team", {}).get("id")
                                t2_id = c2.get("team", {}).get("id")
                                s1 = int(c1.get("score", "0"))
                                s2 = int(c2.get("score", "0"))
                                
                                if t1_id not in real_form: real_form[t1_id] = []
                                if t2_id not in real_form: real_form[t2_id] = []
                                
                                if s1 > s2:
                                    real_form[t1_id].append("V")
                                    real_form[t2_id].append("D")
                                elif s2 > s1:
                                    real_form[t2_id].append("V")
                                    real_form[t1_id].append("D")
                                else:
                                    real_form[t1_id].append("E")
                                    real_form[t2_id].append("E")
              
            if isinstance(res_std, httpx.Response) and res_std.status_code == 200:
                data_std = res_std.json()
                if "children" in data_std and len(data_std["children"]) > 0:
                    total_teams = sum(len(c.get("standings", {}).get("entries", [])) for c in data_std["children"])
                    if total_teams > 0:
                        matches_per_jornada = total_teams // 2
                        
                    for idx, child in enumerate(data_std["children"]):
                        group_name = child.get("name", "Tabla")
                        group_entries = child.get("standings", {}).get("entries", [])
                          
                        group_posiciones = []
                        for e in group_entries:
                            stats = {s["abbreviation"]: s["displayValue"] for s in e.get("stats", [])}
                            pj = stats.get("GP", "0")
                            try:
                                if int(pj) > jornada_actual: jornada_actual = int(pj)
                            except: pass
                              
                            team_name = e.get("team", {}).get("shortDisplayName")
                            team_id = e.get("team", {}).get("id")
                            # Obtener los 5 últimos resultados de la forma real, limitados (más recientes al final)
                            ultimas = real_form.get(team_id, [])[-5:]
                              
                            team_dict = {
                                "rank": stats.get("R", ""),
                                "team": team_name,
                                "logo": e["team"]["logos"][0]["href"] if "logos" in e["team"] else "",
                                "pts": stats.get("P", ""),
                                "pj": pj,
                                "dg": stats.get("GD", ""),
                                "g": stats.get("W", "0"),
                                "e": stats.get("D", "0"),
                                "p": stats.get("L", "0"),
                                "gol": f"{stats.get('F', '0')}:{stats.get('A', '0')}",
                                "ultimas": ultimas
                            }
                            group_posiciones.append(team_dict)
                            if idx == 0:
                                posiciones.append(team_dict)
                                  
                        # Ordenar el grupo por ranking (ascendente)
                        group_posiciones.sort(key=lambda x: int(x["rank"]) if str(x["rank"]).isdigit() else 999)
                        if idx == 0:
                            posiciones.sort(key=lambda x: int(x["rank"]) if str(x["rank"]).isdigit() else 999)

                        grupos.append({
                            "name": group_name,
                            "posiciones": group_posiciones
                        })
            if isinstance(res_scb, httpx.Response) and res_scb.status_code == 200:
                events = events_data  # Usamos la lista de eventos ya parseada y filtrada arriba
                
                # Auto-advance matchday logic
                if jornada <= 0:
                    current_md = 1
                    for i, ev in enumerate(events):
                        st = ev["status"]["type"]["state"]
                        if st in ["pre", "in"]:
                            current_md = (i // matches_per_jornada) + 1
                            break
                    else:
                        current_md = total_jornadas if len(events) > 0 else 1
                    jornada = current_md
                
                if jornada > total_jornadas:
                    jornada = total_jornadas
                    
                start_idx = (jornada - 1) * matches_per_jornada
                end_idx = start_idx + matches_per_jornada
                events_to_show = events[start_idx:end_idx]
                
                for ev in events_to_show:
                    comp = ev["competitions"][0]
                    team_home = comp["competitors"][0]["team"]["shortDisplayName"]
                    team_away = comp["competitors"][1]["team"]["shortDisplayName"]
                    score_home = comp["competitors"][0].get("score", "0")
                    score_away = comp["competitors"][1].get("score", "0")
                    estado = ev["status"]["type"]["state"]
                    if estado == "in": estado = "EN CURSO"
                    elif estado == "post": estado = "FINALIZADO"
                    elif estado == "pre": estado = "PROGRAMADO"
                    if ev["status"]["type"]["name"] == "STATUS_HALFTIME": estado = "ENTRETIEMPO"
                        
                    fecha_raw = ev.get("date", "")
                    fecha_str = ""
                    hora_str = ""
                    if fecha_raw:
                        from datetime import datetime, timedelta
                        try:
                            dt = datetime.strptime(fecha_raw, "%Y-%m-%dT%H:%MZ")
                            dt_local = dt - timedelta(hours=3)
                            dias = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]
                            dia_semana = dias[dt_local.isoweekday() % 7]
                            fecha_str = f"{dia_semana} {dt_local.strftime('%d/%m')}"
                            hora_str = dt_local.strftime("%H:%M")
                        except: pass
                            
                    partidos.append({
                        "id": ev["id"],
                        "team_home": team_home,
                        "team_away": team_away,
                        "logo_home": comp["competitors"][0]["team"].get("logo", ""),
                        "logo_away": comp["competitors"][1]["team"].get("logo", ""),
                        "score_home": score_home,
                        "score_away": score_away,
                        "estado": estado,
                        "fecha": fecha_str,
                        "hora": hora_str
                    })
            else:
                if jornada <= 0:
                    jornada = jornada_actual if jornada_actual > 0 else 1
                if jornada > total_jornadas:
                    jornada = total_jornadas

            
            if isinstance(res_sts, httpx.Response) and res_sts.status_code == 200:
                data_sts = res_sts.json()
                for stat_cat in data_sts.get("stats", []):
                    cat_name = stat_cat.get("displayName", "")
                    
                    if cat_name == "Goals": cat_name = "Goles"
                    elif cat_name == "Assists": cat_name = "Asistencias"
                    elif cat_name == "Yellow Cards": cat_name = "Tarjetas Amarillas"
                    elif cat_name == "Red Cards": cat_name = "Tarjetas Rojas"
                    
                    leaders = []
                    for lead in stat_cat.get("leaders", []):
                        try:
                            athlete = lead.get("athlete", {})
                            team = lead.get("team", {})
                            val = lead.get("value", 0)
                            leaders.append({
                                "jugador": athlete.get("displayName", ""),
                                "logo_equipo": team.get("logos", [{}])[0].get("href", ""),
                                "valor": int(val) if val == int(val) else val
                            })
                        except: pass
                        
                    if leaders:
                        estadisticas.append({
                            "categoria": cat_name,
                            "top": leaders
                        })
    except Exception as e:
        print(f"Error fetching clasificacion: {e}")

    return {
        "jornada": f"FECHA {jornada}",
        "posiciones": posiciones,
        "grupos": grupos,
        "partidos": partidos,
        "estadisticas": estadisticas
    }
