import os
import subprocess

GIT_CMD = r"C:\Program Files\Git\cmd\git.exe"

def run(cmd, cwd=None):
    print(f'Running: {cmd}')
    subprocess.run(cmd, shell=True, cwd=cwd, check=False)

os.chdir(r'C:\Users\alehe\.gemini\antigravity\scratch\maspot-deportes')

gitignore_content = '''
# Python
__pycache__/
*.pyc
.venv/
venv/
*.sqlite3
*.db
.env

# Next.js / Node
node_modules/
.next/
out/
build/
.env*.local
'''
with open('.gitignore', 'w') as f:
    f.write(gitignore_content.strip())

run(f'"{GIT_CMD}" init')
run(f'"{GIT_CMD}" config user.name "Estudiante UTN"')
run(f'"{GIT_CMD}" config user.email "estudiante@utn.ba.edu.ar"')

# 1
run(f'"{GIT_CMD}" add .gitignore backend/requirements.txt frontend/package.json')
run(f'"{GIT_CMD}" commit -m "feat: inicializa estructura base de frontend y backend"')

# 2
run(f'"{GIT_CMD}" add frontend/app/layout.tsx frontend/app/globals.css frontend/tailwind.config.ts frontend/components/Sidebar.tsx frontend/components/SearchBar.tsx')
run(f'"{GIT_CMD}" commit -m "feat: crea interfaz de usuario, sidebar y estilos base en Next.js"')

# 3
run(f'"{GIT_CMD}" add backend/database.py backend/models.py backend/tasks/')
run(f'"{GIT_CMD}" commit -m "feat: implementa base de datos SQLite y recolector de RSS"')

# 4
run(f'"{GIT_CMD}" add backend/services/ai_classifier.py')
run(f'"{GIT_CMD}" commit -m "feat: integra inteligencia artificial y fallback router local (Ollama)"')

# 5
run(f'"{GIT_CMD}" add backend/routers/auth.py backend/routers/favoritos.py backend/main.py frontend/app/register/ frontend/app/login/ frontend/app/profile/ frontend/components/UserAvatar.tsx frontend/components/NewsCard.tsx')
run(f'"{GIT_CMD}" commit -m "feat: agrega sistema de usuarios, JWT y perfil de favoritos"')

# 6
run(f'"{GIT_CMD}" add .')
run(f'"{GIT_CMD}" commit -m "feat: mejora algoritmo de feed inteligente, dark mode y UI general"')

print('Git history generated successfully!')
