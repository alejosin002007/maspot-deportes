import feedparser
import sys
import os
import datetime
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
    feeds_by_league = {
        "La Liga": [
            "https://as.com/rss/futbol/primera.xml",
            "https://e00-marca.uecdn.es/rss/futbol/primera-division.xml",
            "https://www.sport.es/es/rss/barca/rss.xml",
        ],
        "Premier League": [
            "https://www.skysports.com/rss/11661",
            "http://feeds.bbci.co.uk/sport/football/premier-league/rss.xml",
            "https://news.google.com/rss/search?q=Premier+League+football&hl=es-419&gl=AR&ceid=AR:es-419",
        ],
        "Serie A": [
            "https://sport.sky.it/rss/calcio/serie-a.xml",
            "https://news.google.com/rss/search?q=Serie+A+calcio&hl=es-419&gl=AR&ceid=AR:es-419",
        ],
        "Bundesliga": [
            "https://rss.kicker.de/news/bundesliga",
            "https://news.google.com/rss/search?q=Bundesliga+fussball&hl=es-419&gl=AR&ceid=AR:es-419",
        ],
        "Ligue 1": [
            "https://www.france24.com/fr/sports/rss",
            "https://news.google.com/rss/search?q=Ligue+1+football+france&hl=es-419&gl=AR&ceid=AR:es-419",
        ],
        "Liga Argentina": [
            "https://www.ole.com.ar/rss/futbol-primera/",
            "https://www.tycsports.com/rss/liga-profesional-de-futbol.xml",
            "https://www.espn.com.ar/espn/rss/futbol/argentina/news",
        ],
        "Brasileirao": [
            "https://news.google.com/rss/search?q=Brasileirao+futebol&hl=pt-BR&gl=BR&ceid=BR:pt-419",
            "https://www.espn.com.br/espn/rss/futebol/news",
        ],
        "Primeira Liga": [
            "https://news.google.com/rss/search?q=Primeira+Liga+futebol+Portugal&hl=pt-PT&gl=PT&ceid=PT:pt-150",
        ],
        "MLS": [
            "https://www.espn.com/espn/rss/soccer/news",
            "https://news.google.com/rss/search?q=MLS+soccer&hl=en-US&gl=US&ceid=US:en",
        ],
        "Eredivisie": [
            "https://news.google.com/rss/search?q=Eredivisie+voetbal&hl=nl&gl=NL&ceid=NL:nl",
        ],
        "Liga MX": [
            "https://www.espn.com.mx/espn/rss/futbol/mexico/news",
            "https://news.google.com/rss/search?q=Liga+MX+futbol&hl=es-419&gl=MX&ceid=MX:es-419"
        ]
    }
    
    nuevas = 0
    
    for league, feed_urls in feeds_by_league.items():
        for feed_url in feed_urls:
            try:
                feed = feedparser.parse(feed_url)
                # Procesar las entradas (limitado a los 5 más recientes para agilizar la carga)
                for entry in feed.entries[:5]:
                    titulo = entry.get("title", "")
                    resumen = entry.get("summary", "")
                    link = entry.get("link", "")
                    
                    # Extraer imagen (ya sea de media_content o de links/enclosures)
                    imagen_url = None
                    if 'media_content' in entry and len(entry.media_content) > 0:
                        imagen_url = entry.media_content[0].get('url')
                    elif 'links' in entry:
                        for l in entry.links:
                            if l.get('type', '').startswith('image/'):
                                imagen_url = l.get('href')
                                break
                                
                    # Si el RSS no trae la imagen, o si es de Google News (para evitar redirecciones)
                    if not imagen_url or "news.google.com" in link:
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
