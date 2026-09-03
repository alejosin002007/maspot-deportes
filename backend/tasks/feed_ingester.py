import feedparser
import sys
import os
import datetime
import requests
from bs4 import BeautifulSoup

def get_og_image(url):
    try:
        headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
        res = requests.get(url, headers=headers, timeout=5)
        if res.status_code == 200:
            soup = BeautifulSoup(res.text, 'html.parser')
            og = soup.find('meta', property='og:image')
            if og and og.get('content'):
                return og['content']
    except:
        pass
    return None

# Ensure the backend directory is in the path to allow importing from services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from services.ai_classifier import classify_news
from sqlalchemy.orm import Session
from models import Noticia

def ingest_espn_feed(db: Session):
    feed_urls = [
        # Futbol & General
        "https://www.ole.com.ar/rss/",
        "https://as.com/rss/tags/ultimas_noticias.xml",
        "https://www.skysports.com/rss/12040",
        "https://www.france24.com/fr/sports/rss", # Reemplazo funcional para L'Equipe
        "http://feeds.bbci.co.uk/sport/rss.xml",  # Reemplazo funcional para The Athletic UK
        # Basquet / NBA
        "https://www.espn.com/espn/rss/nba/news",
        "https://e00-marca.uecdn.es/rss/baloncesto/nba.xml",
        # Tenis
        "https://e00-marca.uecdn.es/rss/tenis.xml",
        # Motor
        "https://e00-marca.uecdn.es/rss/motor/formula1.xml",
        # Rugby
        "https://www.espn.com/espn/rss/rugby/news",
        # Hockey (fuentes argentinas sin imagen)
        "https://hockeyargentinoplus.com.ar/feed/",
        "https://solohockeyweb.com/feed/"
    ]
    
    nuevas = 0
    
    for feed_url in feed_urls:
        try:
            feed = feedparser.parse(feed_url)
            # Process up to 5 items per feed to avoid overloading the API
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
                            
                # Si el RSS no trae la imagen, tratamos de raspar la web real (OpenGraph)
                if not imagen_url and link:
                    print(f"Buscando imagen OG para: {link}")
                    imagen_url = get_og_image(link)
                
                # Check if already exists in DB
                exists = db.query(Noticia).filter(Noticia.link == link).first()
                if not exists:
                    clasificacion = classify_news(titulo, resumen)
                    nueva_noticia = Noticia(
                        titulo=clasificacion.get("titulo_es", titulo),
                        resumen=clasificacion.get("resumen_es", resumen),
                        link=link,
                        disciplina=clasificacion["disciplina"],
                        fecha=datetime.datetime.now().strftime("%Y-%m-%d %H:%M"),
                        imagen_url=imagen_url
                    )
                    db.add(nueva_noticia)
                    nuevas += 1
                    
                    # Pausa de 2.5 segundos para no saturar el límite gratuito de Groq (30 RPM)
                    import time
                    time.sleep(2.5)
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
