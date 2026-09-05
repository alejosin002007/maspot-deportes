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

def fallback_reglas(titulo: str, resumen: str) -> dict:
    """Intento 5: Sistema de rescate absoluto sin Inteligencia Artificial"""
    texto = (titulo + " " + resumen).lower()
    palabras_clave = {
        "Tenis": ["tenis", "atp", "alcaraz", "wimbledon", "djokovic", "grand slam", "nadal", "federer"],
        "Básquetbol": ["nba", "básquet", "lakers", "campazzo", "lebron", "jordan", "fiba", "celtics"],
        "Rugby": ["rugby", "pumas", "all blacks", "scrum", "try", "seis naciones"],
        "Fórmula 1": ["f1", "fórmula 1", "colapinto", "verstappen", "hamilton", "ferrari", "gran premio", "fia"],
        "Hockey": ["hockey", "leonas", "leones"],
        "Vóley": ["vóley", "voleibol", "de cecco"],
        "Boxeo": ["boxeo", "ring", "ko", "canelo"],
        "Fútbol": ["fútbol", "flamengo", "gol", "messi", "maradona", "libertadores", "champions", "selección", "ajax"]
    }
    for deporte, keywords in palabras_clave.items():
        if any(kw in texto for kw in keywords):
            return {"disciplina": deporte, "confianza": "medio", "titulo_es": titulo, "resumen_es": resumen}
    return {"disciplina": "Otro", "confianza": "bajo", "titulo_es": titulo, "resumen_es": resumen}


def classify_news(titulo: str, resumen: str) -> dict:
    prompt = f"""Eres un asistente experto en deportes y traducción. Analiza la siguiente noticia:
1. Clasifícala en UNA de estas disciplinas: Fútbol, Básquetbol, Tenis, Rugby, Fórmula 1, Atletismo, Boxeo, Natación, Ciclismo, Hockey, Vóley, u 'Otro'.
2. Traduce el título y el resumen al Español neutro (si ya están en español, déjalos igual).
Responde ÚNICAMENTE con un objeto JSON válido con los campos 'disciplina', 'confianza' (alto, medio, bajo), 'titulo_es' (título traducido) y 'resumen_es' (resumen traducido). No incluyas markdown.

Título original: {titulo}
Resumen original: {resumen}"""
    
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
        ollama_res = requests.post(ollama_url, json=ollama_payload, timeout=20)
        
        if ollama_res.status_code == 200:
            content = ollama_res.json().get("response", "").strip()
            return parse_and_clean_json(content, titulo, resumen)
        else:
            raise Exception("Ollama respondió con error")
    except Exception as e:
        print(f"[Orquestador] Ollama falló o está apagado: {e}. Pasando a Lógica de Rescate (Reglas)...")
        
    # Intento 5: REGLAS TRADICIONALES
    return fallback_reglas(titulo, resumen)
