import os
import glob

files = glob.glob('frontend/**/*.tsx', recursive=True)
for f in files:
    if not os.path.isfile(f): continue
    with open(f, 'r', encoding='utf-8') as file:
        content = file.read()
    
    if '127.0.0.1:8000' in content or 'localhost:8000' in content:
        content = content.replace('http://127.0.0.1:8000', 'https://maspot-deportes.onrender.com')
        content = content.replace('http://localhost:8000', 'https://maspot-deportes.onrender.com')
        
        with open(f, 'w', encoding='utf-8', newline='\n') as file:
            file.write(content)
        print(f"Updated {f}")
