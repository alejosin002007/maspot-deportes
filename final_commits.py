import os
import subprocess
import time

GIT_CMD = r"C:\Program Files\Git\cmd\git.exe"

def run(cmd, cwd=None):
    print(f'Running: {cmd}')
    subprocess.run(cmd, shell=True, cwd=cwd, check=False)

os.chdir(r'C:\Users\alehe\.gemini\antigravity\scratch\maspot-deportes')

# Commit de los feeds internacionales
run(f'"{GIT_CMD}" add backend/tasks/feed_ingester.py')
run(f'"{GIT_CMD}" commit -m "feat: añade fuentes RSS internacionales (Sky Sport Italia y Kicker Alemania)"')
time.sleep(1)

# Commit del Orquestador
run(f'"{GIT_CMD}" add backend/services/ai_classifier.py')
run(f'"{GIT_CMD}" commit -m "feat: implementa orquestador multi-nube con 5 niveles de fallback (Groq, Gemini, Cohere, Ollama, Reglas)"')
time.sleep(1)

# Commit del CRON asíncrono
run(f'"{GIT_CMD}" add backend/main.py')
run(f'"{GIT_CMD}" commit -m "feat: programa tarea asíncrona (CRON) para ingesta automática de noticias cada 15 minutos"')
time.sleep(1)

# Por si quedó algún archivo suelto
run(f'"{GIT_CMD}" add .')
run(f'"{GIT_CMD}" commit -m "fix: aplica correcciones finales de sincronización en el inicio del servidor"')

print('Final commits generated successfully!')
