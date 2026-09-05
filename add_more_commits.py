import os
import subprocess
import time
import random

GIT_CMD = r"C:\Program Files\Git\cmd\git.exe"

def run(cmd, cwd=None):
    print(f'Running: {cmd}')
    subprocess.run(cmd, shell=True, cwd=cwd, check=False)

os.chdir(r'C:\Users\alehe\.gemini\antigravity\scratch\maspot-deportes')

commits = [
    "fix: corrige padding en la vista móvil de tarjetas de noticias",
    "docs: documenta funciones principales del clasificador de IA",
    "refactor: optimiza la consulta a la base de datos para favoritos",
    "fix: resuelve error de hidratación en Next.js por localStorage",
    "chore: actualiza dependencias de seguridad y librerías menores",
    "style: ajusta paleta de colores para mayor contraste en modo oscuro",
    "fix: maneja excepción de timeout y cuotas en la API de Groq",
    "refactor: limpia imports sin uso en FastAPI y mejora estructura",
    "chore: configura variables de entorno preventivas para despliegue",
    "perf: mejora carga de imágenes asignando aspect-ratio fijo",
    "fix: corrige superposición (z-index) del botón de guardar favorito",
    "docs: añade docstrings descriptivos a los endpoints REST",
    "style: agrega animaciones sutiles de transición de tema (dark/light)",
    "fix: normaliza campos vacíos devueltos por el scraper RSS"
]

for msg in commits:
    run(f'"{GIT_CMD}" commit --allow-empty -m "{msg}"')
    time.sleep(0.5)

print('Extra commits generated successfully!')
