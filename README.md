# ⚽ Maspot Deportes - Agregador Deportivo Inteligente

Maspot Deportes es una plataforma web moderna que centraliza resultados en tiempo real, tablas de posiciones y noticias deportivas internacionales. Utiliza Inteligencia Artificial para procesar, clasificar y traducir automáticamente grandes volúmenes de información en un ecosistema unificado, limpio y libre de distracciones.

## 🚀 Características Principales

- **Resultados y Posiciones en Vivo:** Conexión concurrente a la API de ESPN para obtener marcadores de las principales ligas del mundo (Premier League, La Liga, Liga Argentina, Champions League, etc.).
- **Estado de Forma Real (V-E-D):** Cálculo algorítmico del rendimiento reciente de los equipos iterando sobre el historial de partidos pasados.
- **Clasificación de Noticias con IA:** Un agente interno (basado en el modelo *GPT-4o-mini* de OpenAI) procesa decenas de canales RSS (Marca, AS, Sport, BBC, The Guardian) y categoriza automáticamente la disciplina y pertinencia de la noticia.
- **Traducción On-the-Fly:** Motor NLP integrado en el cliente web que traduce instantáneamente al español las noticias provenientes de fuentes en inglés u otros idiomas.
- **Diseño Minimalista:** Interfaz *Mobile-First* completamente responsiva construida con Tailwind CSS, optimizada con un moderno y elegante *Dark Mode*.

## 🛠️ Stack Tecnológico

**Frontend:**
- [Next.js](https://nextjs.org/) (React)
- Tailwind CSS
- Fetch API & Google NLP (Traducción en cliente)

**Backend:**
- [FastAPI](https://fastapi.tiangolo.com/) (Python Asíncrono)
- SQLAlchemy (SQLite para Memoria Persistente)
- OpenAI API (Motor LLM)
- `feedparser` y `BeautifulSoup` (Web Scraping RSS)

## 📁 Estructura del Proyecto

El repositorio está dividido en dos grandes bloques:

* `/backend`: Contiene la API REST en Python. Aquí corre el *Cron Job* (`feed_ingester.py`) que recolecta las noticias periódicamente, las clasifica usando OpenAI y las guarda en la base de datos `deportes.db`.
* `/frontend`: Contiene la aplicación web de Next.js. Se encarga del renderizado de la UI, la traducción dinámica y la visualización de datos consumidos de nuestro Backend y de ESPN.

## ⚙️ Instalación y Uso Local

Sigue estos pasos para correr el proyecto en tu computadora local:

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/maspot-deportes.git
cd maspot-deportes
```

### 2. Levantar el Backend (API)
```bash
cd backend
# Instalar dependencias
pip install -r requirements.txt

# Configurar variables de entorno (Crear un archivo .env o exportarlo)
# Necesitas tu clave para la clasificación de noticias:
# OPENAI_API_KEY=tu_clave_aqui

# Iniciar el servidor local
uvicorn main:app --reload
```
*El backend quedará corriendo en `http://localhost:8000`*

### 3. Levantar el Frontend (Web)
Abre una nueva terminal en la raíz del proyecto y ejecuta:
```bash
cd frontend
# Instalar dependencias de Node.js
npm install

# Iniciar el servidor de desarrollo de Next.js
npm run dev
```
*El frontend quedará corriendo en `http://localhost:3000`*

## 📝 Evaluación y Licencia
Este proyecto fue desarrollado en el marco de una evaluación académica/profesional sobre integraciones de Inteligencia Artificial en aplicaciones web (Agentes, LLMs, NLP, Web Scraping y Arquitectura de Software). 

Todos los derechos de las fuentes de noticias y logotipos deportivos pertenecen a sus respectivos creadores (ESPN, BBC, Marca, etc.) y se utilizan únicamente con fines educativos y de demostración.
