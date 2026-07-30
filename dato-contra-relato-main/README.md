# DatoContraRelato

Pipeline automatizado de fact-checking de discursos políticos en video. Recibe una URL (YouTube, YouTube Shorts, TikTok, Instagram Reels) y produce un reporte HTML autocontenido con cada afirmación factual del video contrastada contra fuentes oficiales chilenas e internacionales.

## Sobre este proyecto

Este proyecto fue construido en **hack@latam**, un hackathon de 48 horas, por un equipo de 4 personas: Joaquín Barrales, Javiera Navarrete, Esteban Medina y Matías Pino, compitiendo en el track **def/acc**.

Es un prototipo armado rápido bajo presión de tiempo, con asistencia de Claude Code. No es un producto pulido de producción: hay decisiones tomadas por velocidad y bordes sin terminar.

## Cómo funciona

```
URL  →  audio.mp3  →  transcripción + timestamps  →  claims verificables (JSON)
                                                              ↓
        reporte HTML  ←  veredictos por claim  ←  research (web_search en allowlist)
```

7 pasos, ~1.5–2 min por video corto, ~USD 0.50 de tokens por video:

1. **Descarga** del audio (`yt-dlp`)
2. **Priming prompt dinámico** para Whisper (Claude Haiku, lista de vocabulario)
3. **Transcripción** local con `faster-whisper` (large-v3, GPU si está disponible)
4. **Corrección del transcript** (Claude Haiku, corrige errores fonéticos de Whisper; se puede saltar con `--no-transcript-edit`)
5. **Extracción** de claims verificables (Claude Sonnet, tool use → JSON estructurado)
6. **Investigación y veredicto** por claim, en paralelo (Claude Sonnet + `web_search` en dos tiers: allowlist de fuentes oficiales primero, fallback a web abierta si no hay evidencia). Taxonomía: *Exacto / Parcialmente exacto / Inexacto / Ridículo*
7. **Reporte HTML** autocontenido con timestamps clickables al video original

## Stack

- Python 3.13 (3.14 no funciona: `pydantic-core` sin wheel compatible)
- `yt-dlp` (multi-plataforma: YouTube, Shorts, TikTok, Instagram Reels, etc.)
- `faster-whisper` (transcripción local, GPU opcional vía CUDA)
- `anthropic` (Claude Sonnet 4.6 para extracción, investigación y veredictos; Claude Haiku 4.5 para priming y corrección del transcript)
- FastAPI + uvicorn (web app, progreso en vivo vía WebSocket)
- SQLAlchemy 2.0 + SQLite (historial de análisis en `outputs/politicheck.db`)
- Jinja2 (templates de la web app)
- MiniMax (proveedor LLM alternativo opcional vía `--llm-provider minimax`; la investigación siempre usa Claude)
- `python-dotenv` (manejo de credenciales)

## Setup

### 1. Requisitos del sistema

- **Python 3.13** (3.14 aún no tiene wheel compatible de `pydantic-core`)
- **FFmpeg** (necesario para que yt-dlp convierta audio):
  - Windows: `winget install Gyan.FFmpeg`
  - macOS: `brew install ffmpeg`
  - Linux: `apt install ffmpeg`
- **(Opcional, GPU)** NVIDIA con drivers actualizados para aceleración de Whisper

### 2. Instalación

```bash
git clone https://github.com/Mati3939/dato-contra-relato.git
cd dato-contra-relato
python -m venv .venv

# Windows PowerShell
.\.venv\Scripts\Activate.ps1
# macOS / Linux
source .venv/bin/activate

pip install -r requirements.txt
```

### 3. Aceleración GPU (opcional, recomendado)

`faster-whisper` corre por CPU por defecto. Para usar GPU NVIDIA:

```bash
pip install nvidia-cublas-cu12 "nvidia-cudnn-cu12==9.*"
```

El pipeline auto-detecta CUDA al ejecutar y cae a CPU si algo falla. Para forzar un backend: `--device cuda` o `--device cpu`.

### 4. Credenciales

```bash
cp .env.example .env
# editar .env y poner ANTHROPIC_API_KEY=sk-ant-api03-...
```

Obtener una API key en https://console.anthropic.com/settings/keys.

## Uso

```bash
python main.py "https://www.youtube.com/watch?v=..."

# Forzar idioma (mejora calidad de transcripción si lo sabés):
python main.py "URL" --language es

# Cambiar tamaño de modelo Whisper (default: large-v3):
python main.py "URL" --model medium

# Override del priming prompt:
python main.py "URL" --initial-prompt "Ministerio de Hacienda, DIPRES, IPC, reajuste"

# Forzar device:
python main.py "URL" --device cpu     # forzar CPU
python main.py "URL" --device cuda    # forzar GPU

# Saltar la corrección del transcript (ahorra ~$0.03 por video):
python main.py "URL" --no-transcript-edit

# Solo fuentes del allowlist estricto (sin fallback a web abierta):
python main.py "URL" --no-fallback-search

# Claims investigados en paralelo (default: 5):
python main.py "URL" --concurrency 8

# Desactivar el priming prompt por completo:
python main.py "URL" --no-initial-prompt

# Usar MiniMax para los pasos de texto (la investigación siempre usa Claude):
python main.py "URL" --llm-provider minimax
```

### Web app

```bash
uvicorn web.app:app --port 8000
```

Levanta una interfaz en `http://localhost:8000`:

- Análisis desde el browser (`/analyze`) con progreso en vivo vía WebSocket
- Historial de videos analizados con claims, veredictos y votación anónima por claim (`/v/{video_id}`), persistido en SQLite
- Modo en vivo (`/live`): analiza transmisiones en directo (HLS) por chunks, verificando claims a medida que se emiten

### Estructura de outputs

Cada corrida genera artefactos en `outputs/` (no versionados):

```
outputs/
├── audio/<video_id>.mp3
├── transcripts/<video_id>.json    # texto + segmentos con timestamps
├── claims/<video_id>.json         # claims verificables extraídos
├── research/<video_id>.json       # evidencia recopilada por claim
├── verdicts/<video_id>.json       # veredictos finales + correcciones
├── reports/<video_id>.html        # reporte para compartir
├── live/                          # sesiones del modo en vivo
└── politicheck.db                 # historial de análisis (SQLite, usado por la web app)
```

Cada paso guarda su propio JSON, así que si algo falla podés inspeccionar en qué paso y por qué.

## Fuentes oficiales

El archivo `sources.json` define el allowlist al que se restringe la búsqueda. Por defecto incluye:

- **40 fuentes nacionales** chilenas (Congreso, ministerios, Banco Central, INE, Servel, Consejo para la Transparencia, etc.)
- **7 fuentes internacionales** (CEPAL, FMI, Banco Mundial, OCDE, OMS, UNODC, PAHO)

Cada entrada tiene `domain`, `name`, `category` y `scope` (`"nacional"` o `"internacional"`). Editable directamente sin tocar código.

## Plataformas soportadas

- YouTube (videos y Shorts)
- TikTok
- Instagram Reels (cuentas públicas)
- Facebook, X/Twitter, Vimeo, y demás extractores de yt-dlp

## Diseño y decisiones

- **El texto se preserva literal** en la transcripción y los claims. No hay simplificación editorial, para evitar sesgo.
- **Un job de investigación por claim**, en paralelo via `asyncio`. Esto reduce la latencia total ~5x respecto a serial.
- **`web_search` en dos tiers**: primero restringido por `allowed_domains` al allowlist de fuentes oficiales; si ahí no hay evidencia, un segundo intento en web abierta, marcado como tal en el reporte. Desactivable con `--no-fallback-search`.
- **El reporte HTML es autocontenido** (CSS inline, sin JS, sin dependencias externas). Pesa ~25–40 KB.

## Limitaciones conocidas

- Whisper API local: el modelo `large-v3` necesita ~3 GB de descarga la primera vez (queda en `~/.cache/huggingface`).
- VRAM mínimo recomendado para GPU: 4 GB (usa `int8_float16` para fitear).
- Instagram con cuentas privadas requiere cookies (no implementado).
- Claims muy específicos sobre historia política sin huella documental en fuentes oficiales pueden quedar como "Sin verificar" (esto es deliberado: preferimos honestidad sobre alucinación).

## Licencia

MIT
