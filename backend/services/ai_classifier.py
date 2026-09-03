import os
import json
from groq import Groq
from dotenv import load_dotenv

load_dotenv()

# Inicializar cliente de Groq
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))

def classify_news(titulo: str, resumen: str) -> dict:
    prompt = f"""Eres un asistente experto en deportes y traducción. Analiza la siguiente noticia:
1. Clasifícala en UNA de estas disciplinas: Fútbol, Básquetbol, Tenis, Rugby, Fórmula 1, Atletismo, Boxeo, Natación, Ciclismo, Hockey, Vóley, u 'Otro'.
2. Traduce el título y el resumen al Español neutro (si ya están en español, déjalos igual).
Responde ÚNICAMENTE con un objeto JSON válido con los campos 'disciplina', 'confianza' (alto, medio, bajo), 'titulo_es' (título traducido) y 'resumen_es' (resumen traducido). No incluyas markdown.

Título original: {titulo}
Resumen original: {resumen}"""
    
    try:
        # Intento 1: GROQ (Nube Rápida)
        response = client.chat.completions.create(
            model="groq/compound",
            messages=[{"role": "user", "content": prompt}],
            temperature=0,
            max_tokens=150
        )
        content = response.choices[0].message.content.strip()
    except Exception as e:
        print(f"Groq falló (posible límite). Intentando Ollama Local... Error: {e}")
        try:
            # Intento 2: OLLAMA (Local, Gratis)
            import requests
            ollama_url = "http://localhost:11434/api/generate"
            ollama_payload = {
                "model": "llama3", # Puedes cambiar esto por el modelo que tengas instalado (ej. phi3)
                "prompt": prompt,
                "stream": False
            }
            ollama_res = requests.post(ollama_url, json=ollama_payload, timeout=20)
            if ollama_res.status_code == 200:
                content = ollama_res.json().get("response", "").strip()
            else:
                raise Exception("Ollama no está encendido o devolvió error")
        except Exception as e2:
            print(f"Ollama falló. Usando sistema de emergencia por palabras clave. Error: {e2}")
            # Intento 3: FALLBACK POR PALABRAS CLAVE (Diccionario)
            texto = (titulo + " " + resumen).lower()
            palabras_clave = {
                "Tenis": ["tenis", "atp", "alcaraz", "wimbledon", "djokovic", "grand slam", "nadal", "federer"],
                "Básquetbol": ["nba", "básquet", "lakers", "campazzo", "lebron", "jordan", "FIBA", "celtics"],
                "Rugby": ["rugby", "pumas", "all blacks", "scrum", "try", "seis naciones", "springboks"],
                "Fórmula 1": ["f1", "fórmula 1", "colapinto", "verstappen", "hamilton", "ferrari", "gran premio", "fia"],
                "Hockey": ["hockey", "leonas", "leones"],
                "Vóley": ["vóley", "voleibol", "de cecco"],
                "Boxeo": ["boxeo", "ring", "knockout", "ko", "canelo"],
                "Fútbol": ["fútbol", "flamengo", "gol", "messi", "maradona", "libertadores", "champions", "selección", "ajax", "chelsea"]
            }
            for deporte, keywords in palabras_clave.items():
                if any(kw in texto for kw in keywords):
                    return {"disciplina": deporte, "confianza": "medio", "titulo_es": titulo, "resumen_es": resumen}
            return {"disciplina": "Otro", "confianza": "bajo", "titulo_es": titulo, "resumen_es": resumen}

    # Procesar limpieza de Markdown del JSON devuelto por Groq u Ollama
    if content.startswith("```json"):
        content = content[7:]
    if content.startswith("```"):
        content = content[3:]
    if content.endswith("```"):
        content = content[:-3]
        
    try:
        import json
        return json.loads(content.strip())
    except:
        return {"disciplina": "Otro", "confianza": "bajo", "titulo_es": titulo, "resumen_es": resumen}
