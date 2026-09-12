import feedparser
import sys
import os
import datetime
import time
import requests
from bs4 import BeautifulSoup
from deep_translator import GoogleTranslator
import random
import time

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

import html
import re

def limpiar_html(texto):
    if not texto: return ""
    return html.unescape(re.sub(r'<[^>]+>', '', texto)).strip()

def traducir_es(texto, league=""):
    if not texto: return ""
    try:
        from deep_translator import GoogleTranslator
        translated = GoogleTranslator(source='auto', target='es').translate(texto)
        if "Error 500" in translated or "That's an error" in translated:
            return texto
        return translated
    except Exception as e:
        print("Traduccion fallida:", e)
        return texto

# Ensure the backend directory is in the path to allow importing from services
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
from database import SessionLocal
from models import Noticia

def ingest_espn_feed(db):
    print("Iniciando tarea periódica de ingesta de noticias deportivas...")
    now = time.time()
    
    # Palabras clave prohibidas (otros deportes)
    forbidden_keywords = [
        "rugby", "tenis", "basquet", "f1", "formula 1", "nba", "boxeo", "natacion", "voley", "atletismo", 
        "colapinto", "pumas", "alcaraz", "djokovic", "sinner", "cerundolo", "nadal", "sabalenka", "fritz",
        "motogp", "motos", "pole", "gasly", "ciclismo", "piloto", "escuderia", "red bull", "mercedes", "ferrari", "verstappen", "hamilton", "sainz"
    ]

    feeds_by_league = {
        "La Liga": [
            ("https://e00-marca.uecdn.es/rss/futbol/primera-division.xml", "spanish"),
            ("https://as.com/rss/futbol/primera.xml", "spanish"),
        ],
        "Premier League": [
            ("https://e00-marca.uecdn.es/rss/futbol/premier-league.xml", "spanish"),
            ("https://www.sport.es/es/rss/premier-league/rss.xml", "spanish"),
            ("http://feeds.bbci.co.uk/sport/football/premier-league/rss.xml", "english"),
            ("https://www.theguardian.com/football/premierleague/rss", "english"),
        ],
        "Serie A": [
            ("https://www.tuttosport.com/rss/calcio/serie-a", "italian"),
            ("https://e00-marca.uecdn.es/rss/futbol/liga-italiana.xml", "spanish"),
            ("https://www.sport.es/es/rss/serie-a/rss.xml", "spanish"),
        ],
        "Bundesliga": [
            ("https://www.90min.de/posts.rss", "german"),
            ("https://e00-marca.uecdn.es/rss/futbol/bundesliga.xml", "spanish"),
            ("https://www.sport.es/es/rss/bundesliga/rss.xml", "spanish"),
        ],
        "Ligue 1": [
            ("https://rmcsport.bfmtv.com/rss/football/ligue-1/", "french"),
            ("https://e00-marca.uecdn.es/rss/futbol/liga-francesa.xml", "spanish"),
            ("https://www.sport.es/es/rss/ligue-1/rss.xml", "spanish"),
        ],
        "Liga Argentina": [
            ("https://www.tycsports.com/rss/liga-profesional-de-futbol.xml", "spanish"),
            ("https://www.ole.com.ar/rss/futbol-primera/", "spanish")
        ],
        "Brasileirao": [
            ("https://e00-marca.uecdn.es/rss/futbol/america.xml", "spanish"),
        ],
        "Primeira Liga": [
            ("https://www.record.pt/rss", "portuguese"),
        ],
        "MLS": [
            ("https://e00-marca.uecdn.es/rss/futbol/estados-unidos.xml", "spanish"),
        ],
        "Eredivisie": [
            ("https://www.voetbalprimeur.nl/rss/", "dutch"),
        ],
        "Internacional": [
            ("https://e00-marca.uecdn.es/rss/futbol/seleccion.xml", "spanish"),
            ("https://www.ole.com.ar/rss/futbol-internacional/", "spanish"),
            ("https://as.com/rss/futbol/internacional.xml", "spanish"),
        ]
    }
    now = time.time()
    
    # Palabras clave prohibidas (otros deportes)
    forbidden_keywords = [
        "rugby", "tenis", "basquet", "f1", "formula 1", "nba", "boxeo", "natacion", "voley", "atletismo", 
        "colapinto", "pumas", "alcaraz", "djokovic", "sinner", "cerundolo", "nadal", "sabalenka", "fritz",
        "motogp", "motos", "pole", "gasly", "ciclismo", "piloto", "escuderia", "red bull", "mercedes", "ferrari", "verstappen", "hamilton", "sainz"
    ]
    
    from deep_translator import MyMemoryTranslator
    
    nuevas = 0
    
    for league, feed_list in feeds_by_league.items():
        for feed_url, source_lang in feed_list:
            try:
                headers = {'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'}
                res = requests.get(feed_url, headers=headers, timeout=10)
                feed = feedparser.parse(res.content)
                
                # Procesar las entradas (limitado a los 25 más recientes para poblar bien la portada)
                nuevas = 0
                procesadas = 0
                for entry in feed.entries:
                    if procesadas >= 25:
                        break  # Limitar a las 25 mejores noticias válidas de cada feed
                        
                    # FILTRO DE FECHA ESTRICTO: NO NOTICIAS VIEJAS (> 7 dias)
                    if hasattr(entry, 'published_parsed') and entry.published_parsed:
                        import calendar
                        entry_time = calendar.timegm(entry.published_parsed)
                        days_old = (now - entry_time) / 86400
                        if days_old > 7:
                            continue # Ignorar noticias viejas

                    titulo_raw = limpiar_html(entry.get("title", "").replace("<![CDATA[", "").replace("]]>", ""))
                    resumen_raw = limpiar_html(entry.get("summary", "").replace("<![CDATA[", "").replace("]]>", ""))
                    link = entry.get("link", "")
                    
                    # Filtro estricto para Record.pt (Primeira Liga) para que solo pase fǧtbol
                    if league == "Primeira Liga" and "/futebol/" not in link:
                        continue
                    
                    # VERIFICAR SI YA EXISTE EN BD PARA AHORRAR TRADUCCIONES Y EVITAR CRASH
                    if db.query(Noticia).filter(Noticia.link == link).first():
                        procesadas += 1
                        continue
                    
                    # FILTRO DE OTROS DEPORTES ANTES DE TRADUCIR (para ahorrar tiempo si es obvio)
                    titulo_lower = titulo_raw.lower()
                    if any(kw in titulo_lower for kw in forbidden_keywords):
                        print(f"Descartada por contener otra disciplina: {titulo_raw}")
                        continue
                        
                    # El frontend ahora se encarga de traducir nativamente con el widget de Google Translate
                    # Así evitamos que el servidor Render colapse por timeouts (10+ minutos traduciendo)
                    titulo = titulo_raw
                    resumen = resumen_raw
                    
                    # Extraer imagen (ya sea de media_content o de links/enclosures o Bing)
                    imagen_url = None
                    if 'news_image' in entry:
                        imagen_url = entry.news_image
                    elif 'media_content' in entry and len(entry.media_content) > 0:
                        imagen_url = entry.media_content[0].get('url')
                    elif 'links' in entry:
                        for l in entry.links:
                            if l.get('type', '').startswith('image/'):
                                imagen_url = l.get('href')
                                break
                                
                    final_url = link
                    if not imagen_url:
                        print(f"Resolviendo URL final e imagen para: {link}")
                        img_tmp, final_url = resolve_url_and_image(link)
                        if img_tmp:
                            imagen_url = img_tmp
                    else:
                        if "bing.com/news/apiclick.aspx" in link:
                            import urllib.parse
                            parsed = urllib.parse.urlparse(link)
                            qs = urllib.parse.parse_qs(parsed.query)
                            if 'url' in qs:
                                final_url = qs['url'][0]
                        pass
                        
                    link = final_url # Actualizar al enlace real
                    
                    try:
                        # Obtener fecha de publicacion real del RSS, convirtiendo de UTC a Local (-3)
                        fecha_str = datetime.datetime.now().strftime("%Y-%m-%d %H:%M")
                        if hasattr(entry, 'published_parsed') and entry.published_parsed:
                            import calendar
                            from datetime import timezone, timedelta
                            utc_timestamp = calendar.timegm(entry.published_parsed)
                            dt_utc = datetime.datetime.fromtimestamp(utc_timestamp, tz=timezone.utc)
                            dt_local = dt_utc.astimezone(timezone(timedelta(hours=-3)))
                            fecha_str = dt_local.strftime("%Y-%m-%d %H:%M")
                            
                        # Insertar en BD
                        nueva_noticia = Noticia(
                            titulo=titulo,
                            resumen=resumen,
                            link=link,
                            disciplina=league,
                            fecha=fecha_str,
                            imagen_url=imagen_url
                        )
                        db.add(nueva_noticia)
                        db.commit()
                        nuevas += 1
                        procesadas += 1
                    except Exception as e:
                        db.rollback()
                        print(f"Error guardando entrada en BD (probablemente duplicada): {e}")
                        
            except Exception as e:
                print(f"Error procesando el feed {feed_url}: {e}")
                
    
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
