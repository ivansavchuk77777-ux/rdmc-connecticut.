# RDMC Sol — Vivora local live-avatar setup

This project uses Vivora as the optional self-hosted live-avatar engine for Sol.

## What this gives RDMC

- Sol can listen through the microphone with Whisper.
- Sol can answer with a local model through Ollama.
- Sol can speak with local/free TTS.
- MuseTalk animates Sol's mouth in sync with speech.
- A short source video can add natural head movement; a photo gives lip-sync on a still frame.
- The avatar engine runs on your own computer, so there is no HeyGen subscription requirement.

## Requirements

Install Docker Desktop with Compose v2. A GPU is strongly recommended for real-time MuseTalk. CPU mode works for testing but can be much slower.

## Install Vivora

```bash
git clone https://github.com/sur950/vivora.git
cd vivora
./start.sh
```

Vivora starts these local services:

- Web app: http://localhost:3000
- Backend API: http://localhost:8000
- API docs: http://localhost:8000/docs

## Enable real lip-sync

Run once inside the Vivora folder:

```bash
bash scripts/setup_musetalk.sh
./start.sh --stop
./start.sh
```

## Run without paid AI APIs

Use Ollama as Vivora's local language-model provider. Install Ollama, then run a local model such as:

```bash
ollama run llama3.1
```

Set Vivora's `.env` to use the local Ollama provider. Vivora can then use Whisper locally for speech recognition and local/free TTS fallbacks for speech.

## Create Sol

1. Open http://localhost:3000.
2. Sign in to the local Vivora app.
3. Upload the existing RDMC `sol-avatar.jpg`, or preferably a short 10–20 second frontal source video of the approved Sol appearance for natural head movement.
4. Name the avatar `RDMC Sol`.
5. Start a Vivora conversation session with that avatar.

## RDMC integration

Open `sol-vivora.html` from the RDMC app. It provides a launcher for the local Vivora instance and keeps the existing RDMC member-access model separate from the avatar engine.

### Important architecture note

GitHub Pages is HTTPS, while a default local Vivora install uses plain HTTP/WebSocket on localhost. Browsers can block direct mixed-content API/WebSocket calls from a public HTTPS page into an insecure local service. For the first working prototype, RDMC launches the local Vivora UI directly. A later production deployment should expose Vivora behind HTTPS/WSS (for example through a reverse proxy or a secure host) before embedding the live session directly inside the public RDMC page.

## Security

Do not put Supabase service-role keys, private API keys, or local Vivora admin credentials in frontend JavaScript. RDMC owner-only editing permissions remain enforced separately in Supabase; members may communicate with Sol without receiving RDMC administration rights.
