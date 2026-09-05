import feedparser
import sys
import os
import datetime
import time
import requests
from bs4 import BeautifulSoup

def resolve_url_and_image(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        res = requests.get(url, headers=headers, timeout=5, allow_redirects=True)
        final_url = res.url
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            og = soup.find('meta', property='og:image')
            if og and og.get('content'):
                return og['content'], final_url
        return None, final_url
    except:
        pass
    return None, url

# Ensure the backend directory is in the path to allow importing from services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from sqlalchemy.orm import Session
from models import Noticia

def ingest_espn_feed(db: Session):
    # FUENTES DIRECTAS: NO SE USA GOOGLE NEWS COMO INTERMEDIARIO
    feeds_by_league = {
        "La Liga": [
            "https://as.com/rss/futbol/primera.xml",
            "https://e00-marca.uecdn.es/rss/futbol/primera-division.xml",
            "https://www.sport.es/es/rss/barca/rss.xml",
        ],
        "Premier League": [
            "https://www.skysports.com/rss/11661",
            "http://feeds.bbci.co.uk/sport/football/premier-league/rss.xml"
        ],
        "Serie A": [
            "https://e00-marca.uecdn.es/rss/futbol/liga-italiana.xml",
            "https://sport.sky.it/rss/calcio/serie-a.xml"
        ],
        "Bundesliga": [
            "https://rss.kicker.de/news/bundesliga",
            "https://e00-marca.uecdn.es/rss/futbol/bundesliga.xml"
        ],
        "Ligue 1": [
            "https://e00-marca.uecdn.es/rss/futbol/liga-francesa.xml",
            "https://rmcsport.bfmtv.com/rss/football/ligue-1/"
        ],
        "Liga Argentina": [
            "https://www.tycsports.com/rss/liga-profesional-de-futbol.xml",
            "https://www.ole.com.ar/rss/futbol-primera/",
            "https://e00-marca.uecdn.es/rss/futbol/futbol-america.xml"
        ],
        "Brasileirao": [
            "https://ge.globo.com/rss/futebol/brasileirao-serie-a/",
            "https://www.espn.com.br/espn/rss/futebol/news",
        ],
        "Primeira Liga": [
            "https://www.ojogo.pt/rss/futebol/1a-liga.xml"
        ],
        "MLS": [
            "https://e00-marca.uecdn.es/rss/futbol/mls.xml",
        ],
        "Eredivisie": [
            "https://www.voetbalprimeur.nl/rss/",
            "https://www.telegraaf.nl/sport/voetbal/rss"
        ],
        "Liga MX": [
            "https://www.espn.com.mx/espn/rss/futbol/mexico/news",
        ]
    }
    
    nuevas = 0
    now = time.time()
    
    # Palabras clave prohibidas (otros deportes)
    forbidden_keywords = ["rugby", "tenis", "basquet", "f1", "formula 1", "nba", "boxeo", "natacion", "voley", "atletismo", "colapinto", "pumas", "alcaraz", "djokovic", "sinner", "cerundolo", "nadal", "sabalenka", "fritz"]

    
    for league, feed_urls in feeds_by_league.items():
        for feed_url in feed_urls:
            try:
                feed = feedparser.parse(feed_url)
                # Procesar las entradas (limitado a los 8 más recientes para agilizar la carga)
                for entry in feed.entries[:8]:
                    
                    # FILTRO DE FECHA ESTRICTO: NO NOTICIAS VIEJAS (> 7 dias)
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        entry_time = time.mktime(entry.published_parsed)
                        days_old = (now - entry_time) / 86400
                        if days_old > 7:
                            continue # Ignorar noticias viejas

                    titulo = entry.get("title", "")
                    resumen = entry.get("summary", "")
                    link = entry.get("link", "")
                    
                    # FILTRO DE OTROS DEPORTES
                    titulo_lower = titulo.lower()
                    if any(kw in titulo_lower for kw in forbidden_keywords):
                        print(f"Descartada por contener otra disciplina: {titulo}")
                        continue
                    
                    # Extraer imagen (ya sea de media_content o de links/enclosures)
                    imagen_url = None
                    if 'media_content' in entry and len(entry.media_content) > 0:
                        imagen_url = entry.media_content[0].get('url')
                    elif 'links' in entry:
                        for l in entry.links:
                            if l.get('type', '').startswith('image/'):
                                imagen_url = l.get('href')
                                break
                                
                    # Si el RSS no trae la imagen, la resolvemos de la pagina
                    if not imagen_url:
                        print(f"Resolviendo URL final e imagen para: {link}")
                        img_temp, link = resolve_url_and_image(link)
                        if not imagen_url:
                            imagen_url = img_temp
                    
                    # Check if already exists in DB
                    exists = db.query(Noticia).filter(Noticia.link == link).first()
                    if not exists:
                        # Asignación de liga 100% exacta por el origen del Feed
                        nueva_noticia = Noticia(
                            titulo=titulo,
                            resumen=resumen,
                            link=link,
                            disciplina=league,
                            fecha=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                            imagen_url=imagen_url
                        )
                        db.add(nueva_noticia)
                        nuevas += 1
                        
            except Exception as e:
                print(f"Error procesando el feed {feed_url}: {e}")
                
    db.commit()
    
    # Sistema de Auto-Limpieza: Mantener solo las últimas 300 noticias para evitar que la DB crezca infinitamente
    try:
        if db.query(Noticia).count() > 300:
            viejas = db.query(Noticia).order_by(Noticia.id.desc()).offset(300).all()
            for v in viejas:
                db.delete(v)
            db.commit()
            print(f"Limpieza completada: se borraron {len(viejas)} noticias viejas.")
    except Exception as e:
        print("Error en limpieza:", e)
    return nuevas

if __name__ == "__main__":
    print("Para probar la ingesta, levanta el servidor y llama a /api/refresh")
