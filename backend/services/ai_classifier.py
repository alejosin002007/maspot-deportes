import re

def fallback_reglas(titulo: str, resumen: str) -> dict:
    """Sistema de rescate absoluto sin Inteligencia Artificial"""
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
    """Versión ligera: Clasifica usando solo expresiones regulares para ahorrar tokens de IA"""
    return fallback_reglas(titulo, resumen)
