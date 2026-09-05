import os
import json
import requests
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Inicializar clientes de API
GROQ_API_KEY = os.environ.get("GROQ_API_KEY")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
COHERE_API_KEY = os.environ.get("COHERE_API_KEY")

# Groq client puede inicializarse con una llave falsa si no existe, solo para no romper el import
groq_client = Groq(api_key=GROQ_API_KEY or "dummy_key")

def parse_and_clean_json(content: str, titulo: str, resumen: str) -> dict:
    """Función de ayuda para limpiar el texto devuelto por los modelos y convertirlo a JSON"""
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
        
    try:
        return json.loads(content.strip())
    except:
        # Si la IA respondió texto basura que no es JSON, enviarlo al fallback manual
        raise Exception("El formato devuelto no es un JSON válido")

import re

def fallback_reglas(titulo: str, resumen: str) -> dict:
    """Intento 5: Sistema de rescate absoluto sin Inteligencia Artificial"""
    texto = (titulo + " " + resumen).lower()
    palabras_clave = {
        "La Liga": ["real madrid", "barcelona", "atlético madrid", "sevilla", "betis", "la liga", "españa", "mbappé", "vinicius", "yamal", "athletic"],
        "Premier League": ["manchester", "arsenal", "chelsea", "liverpool", "tottenham", "premier", "inglaterra", "aston villa", "city", "haaland"],
        "Serie A": ["juventus", "milan", "inter", "napoli", "roma", "serie a", "italia", "lazio", "fiorentina"],
        "Bundesliga": ["bayern", "dortmund", "leverkusen", "leipzig", "bundesliga", "alemania", "stuttgart"],
        "Ligue 1": ["psg", "marseille", "lyon", "monaco", "ligue 1", "francia", "paris saint-germain"],
        "Liga Argentina": ["boca", "river", "racing", "independiente", "san lorenzo", "argentina", "lpf", "liga profesional", "velez", "talleres", "estudiantes"],
        "Brasileirão": ["flamengo", "palmeiras", "sao paulo", "corinthians", "brasileirao", "brasil", "fluminense", "gremio", "botafogo", "atletico mineiro"],
        "Primeira Liga": ["benfica", "porto", "sporting", "primeira liga", "portugal", "braga"],
        "MLS": ["inter miami", "galaxy", "mls", "estados unidos", "usa", "messi"],
        "Eredivisie": ["ajax", "psv", "feyenoord", "eredivisie", "paises bajos", "holanda"],
        "Liga MX": ["america", "chivas", "cruz azul", "pumas", "tigres", "monterrey", "liga mx", "mexico"]
    }
    for liga, keywords in palabras_clave.items():
        for kw in keywords:
            if re.search(r'\b' + re.escape(kw) + r'\b', texto):
                return {"disciplina": liga, "confianza": "medio", "titulo_es": titulo, "resumen_es": resumen}
    return {"disciplina": "Fútbol Internacional", "confianza": "bajo", "titulo_es": titulo, "resumen_es": resumen}


def classify_news(titulo: str, resumen: str) -> dict:
    prompt = f"""
    Eres un periodista deportivo experto en fútbol mundial.
    Dado el siguiente título y resumen de una noticia, identifica a cuál de estas ligas pertenece principalmente:
    La Liga, Premier League, Serie A, Bundesliga, Ligue 1, Liga Argentina, Brasileirão, Primeira Liga, MLS, Eredivisie, Liga MX, o "Fútbol Internacional" si son selecciones o competiciones europeas generales (Champions, Mundial).
    Traduce el título y el resumen al Español neutro si están en otro idioma.
    
    Responde ÚNICAMENTE con un objeto JSON válido con las claves: 'disciplina' (nombre exacto de la liga), 'confianza' (alto, medio, bajo), 'titulo_es' (traducido), y 'resumen_es' (traducido).
    No agregues Markdown ni explicaciones.
    
    Título: {titulo}
    Resumen: {resumen}
    """
    
    # Intento 1: GROQ (Velocidad Extrema LPU)
    try:
        if not GROQ_API_KEY or GROQ_API_KEY == "dummy_key":
            raise Exception("No hay GROQ_API_KEY configurada")
            
        response = groq_client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=150
        )
        content = response.choices[0].message.content.strip()
        return parse_and_clean_json(content, titulo, resumen)
    except Exception as e:
        print(f"[Orquestador] Groq falló o no disponible: {e}. Pasando a Gemini...")
        
    # Intento 2: GEMINI (Nube Alternativa Google)
    try:
        if not GEMINI_API_KEY:
            raise Exception("No hay GEMINI_API_KEY configurada")
            
        gemini_url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key={GEMINI_API_KEY}"
        gemini_res = requests.post(gemini_url, json={"contents": [{"parts": [{"text": prompt}]}]}, timeout=10)
        if gemini_res.status_code != 200:
            raise Exception(f"HTTP Error {gemini_res.status_code}")
            
        content = gemini_res.json()["candidates"][0]["content"]["parts"][0]["text"]
        return parse_and_clean_json(content, titulo, resumen)
    except Exception as e:
        print(f"[Orquestador] Gemini falló o no disponible: {e}. Pasando a Cohere...")
        
    # Intento 3: COHERE (Nube Alternativa NLP)
    try:
        if not COHERE_API_KEY:
            raise Exception("No hay COHERE_API_KEY configurada")
            
        cohere_url = "https://api.cohere.ai/v1/generate"
        headers = {"Authorization": f"Bearer {COHERE_API_KEY}", "Content-Type": "application/json"}
        cohere_res = requests.post(cohere_url, headers=headers, json={"prompt": prompt, "max_tokens": 150}, timeout=10)
        
        if cohere_res.status_code != 200:
            raise Exception(f"HTTP Error {cohere_res.status_code}")
            
        content = cohere_res.json()["generations"][0]["text"]
        return parse_and_clean_json(content, titulo, resumen)
    except Exception as e:
        print(f"[Orquestador] Cohere falló o no disponible: {e}. Pasando a Ollama Local...")

    # Intento 4: OLLAMA (Local, Privado, Sin Internet)
    try:
        ollama_url = "http://localhost:11434/api/generate"
        ollama_payload = {"model": "llama3", "prompt": prompt, "stream": False}
        ollama_res = requests.post(ollama_url, json=ollama_payload, timeout=1)
        
        if ollama_res.status_code == 200:
            content = ollama_res.json().get("response", "").strip()
            return parse_and_clean_json(content, titulo, resumen)
        else:
            raise Exception("Ollama respondió con error")
    except Exception as e:
        print(f"[Orquestador] Ollama falló o está apagado: {e}. Pasando a Lógica de Rescate (Reglas)...")
        
    # Intento 5: REGLAS TRADICIONALES
    return fallback_reglas(titulo, resumen)
