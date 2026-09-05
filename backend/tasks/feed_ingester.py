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
        # La Liga (España)
        "https://as.com/rss/futbol/primera.xml",
        "https://e00-marca.uecdn.es/rss/futbol/primera-division.xml",
        "https://www.sport.es/es/rss/barca/rss.xml",
        
        # Premier League (Inglaterra)
        "https://www.skysports.com/rss/11661",
        "http://feeds.bbci.co.uk/sport/football/premier-league/rss.xml",
        "https://news.google.com/rss/search?q=Premier+League+football&hl=es-419&gl=AR&ceid=AR:es-419",
        
        # Serie A (Italia)
        "https://sport.sky.it/rss/calcio/serie-a.xml",
        "https://news.google.com/rss/search?q=Serie+A+calcio&hl=es-419&gl=AR&ceid=AR:es-419",
        
        # Bundesliga (Alemania)
        "https://rss.kicker.de/news/bundesliga",
        "https://news.google.com/rss/search?q=Bundesliga+fussball&hl=es-419&gl=AR&ceid=AR:es-419",
        
        # Ligue 1 (Francia)
        "https://www.france24.com/fr/sports/rss",
        "https://news.google.com/rss/search?q=Ligue+1+football+france&hl=es-419&gl=AR&ceid=AR:es-419",
        
        # Liga Argentina
        "https://www.ole.com.ar/rss/futbol-primera/",
        "https://www.tycsports.com/rss/liga-profesional-de-futbol.xml",
        "https://www.espn.com.ar/espn/rss/futbol/argentina/news",
        
        # Brasileirão (Brasil)
        "https://news.google.com/rss/search?q=Brasileirao+futebol&hl=pt-BR&gl=BR&ceid=BR:pt-419",
        "https://www.espn.com.br/espn/rss/futebol/news",
        
        # Primeira Liga (Portugal)
        "https://news.google.com/rss/search?q=Primeira+Liga+futebol+Portugal&hl=pt-PT&gl=PT&ceid=PT:pt-150",
        
        # MLS (USA)
        "https://www.espn.com/espn/rss/soccer/news",
        "https://news.google.com/rss/search?q=MLS+soccer&hl=en-US&gl=US&ceid=US:en",
        
        # Eredivisie (Países Bajos)
        "https://news.google.com/rss/search?q=Eredivisie+voetbal&hl=nl&gl=NL&ceid=NL:nl",
        
        # Liga MX (México)
        "https://www.espn.com.mx/espn/rss/futbol/mexico/news",
        "https://news.google.com/rss/search?q=Liga+MX+futbol&hl=es-419&gl=MX&ceid=MX:es-419"
    ]
    
    nuevas = 0
    
    for feed_url in feed_urls:
        try:
            feed = feedparser.parse(feed_url)
            # Analizar las últimas 30 noticias de cada feed (antes eran solo 5)
            for entry in feed.entries[:30]:
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
