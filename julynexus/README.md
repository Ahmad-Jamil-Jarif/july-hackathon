# JulyNexus — Evidentiary Truth, Civic Dignity, Verified Memory

> **Project Code:** JulyNexus · **Hackathon:** July Uprising Memorial Hackathon (2024 cohort) · **Build window:** 48h

JulyNexus is an end-to-end civic-tech platform that turns the three cascading crises of the July Uprising (epistemic erosion, historical tampering, humanitarian/dignity deficit) into a single trustworthy infrastructure.

---

## ⚡ The Problem in 90 seconds

| Crisis | What breaks | Real-world consequence |
|---|---|---|
| Information erasure & disinformation | Deepfakes, coordinated inauthentic networks, re-uploaded propaganda | Public memory is rewritten within hours |
| Historical tampering & ephemerality | Crowdsourced evidence on Big Tech is one takedown away from gone | Court cases collapse; martyrs get erased |
| Humanitarian & dignity deficit | Victim aid is filed in spreadsheets; families wait months | Re-traumatization, corruption, invisible victims |

---

## 🧩 The Solution — One Platform, Three Pillars

```
                ┌─────────────────────────────────────────────┐
                │              JulyNexus Platform              │
                └─────────────────────────────────────────────┘
              ╱                    │                       ╲
   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────────┐
   │  1. VERIFY       │  │  2. PRESERVE     │  │  3. SERVE            │
   │  AI Forensics    │  │  IPFS Vault +    │  │  Aid Ledger +        │
   │  + C2PA          │  │  Append-only     │  │  ZK Identity Shield   │
   │  Provenance      │  │  Ledger          │  │  + Civic Kiosk       │
   └──────────────────┘  └──────────────────┘  └──────────────────────┘
```

**1. Verify** — A FastAPI ML pipeline ingests uploaded photo/video/audio and returns:
- Deepfake-likelihood score (optical-flow + frame-jitter heuristics)
- EXIF metadata extraction with tamper flagging
- C2PA-style content provenance hash
- Perceptual-hash duplicate detection (CLIP-style, deterministic)

**2. Preserve** — Verified evidence is content-addressed (SHA-256 CID) and stored on a local IPFS-emulation layer plus an append-only JSONL ledger. Even if the central server is seized, every node holding the ledger can re-verify and re-serve the evidence.

**3. Serve** — A victim aid portal with:
- **Zero-Knowledge Identity Shield** — victim identity is stored as a salted hash; disbursers verify a ZK-style claim without ever learning the PII
- **Transparent Relief Ledger** — every taka disbursed is on-ledger with a public explorer
- **Civic Dignity Kiosk** — an offline-first ESP32 + RFID device that lets citizens log tributes, file reports, and trigger panic signals even during internet shutdowns

---

## 🏗️ Architecture

```
[ Citizen / Journalist / IoT Kiosk ]
            │
            ▼
   [ Next.js 14 Frontend ] ──── /api/* ──── [ FastAPI Backend ]
            │                                    │
            │                                    ├─► AI Verification (OpenCV, Pillow, imagehash)
            │                                    ├─► IPFS Vault (content-addressed SHA-256)
            │                                    ├─► Append-only Ledger (JSONL)
            │                                    └─► Aid + ZK Identity Service
            │
            └─► Map view (Leaflet), Civic Pledge Wall, Memorial Tribute Graph
```

Full architecture diagram: `docs/architecture.md`

---

## ��️ Tech Stack

| Layer | Tech |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Framer Motion, Lucide Icons, Leaflet.js |
| Backend | Python 3.11 + FastAPI, SQLAlchemy + SQLite, Pillow, OpenCV, imagehash |
| Storage | Local content-addressed vault (IPFS-style), append-only JSONL ledger |
| IoT / Hardware | ESP32 + Arduino, MFRC522 RFID, 16x2 I2C LCD, PIR, buzzer, LEDs, SD card |
| Simulator | In-browser kiosk simulator (canvas + JS) for environments without hardware |
| Auth / Security | Parameterized SQL, ZK-style salted-hash identity, input sanitization, CORS allowlist |

---

## 🚀 Quick Start (Windows / PowerShell)

### 1. Backend

```powershell
cd julynexus/backend
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
python -m app.seed           # seed sample martyrs, testimonies, aid ledger
uvicorn app.main:app --reload --port 8000
```

Open API docs: <http://localhost:8000/docs>

### 2. Frontend

```powershell
cd julynexus/frontend
npm install
npm run dev
```

Open: <http://localhost:3000>

### 3. IoT Kiosk Simulator (no hardware needed)

Visit <http://localhost:3000/kiosk> — full browser simulation of the ESP32 device including RFID scan, LCD, LEDs, and offline-queue buffering.

### 4. Real hardware (optional)

Open `iot/firmware/julynexus_kiosk.ino` in Arduino IDE and flash to an ESP32. See `iot/tinkercad/wiring.md` for the Tinkercad schematic.

---

## 📦 Repo Layout

```
julynexus/
├── README.md                  ← you are here
├── backend/                   ← FastAPI + AI pipeline + IPFS vault + ledger
│   ├── app/
│   │   ├── main.py
│   │   ├── routes/            ← verify, vault, aid, kiosk, ledger
│   │   ├── services/          ← ai_engine, ipfs_vault, zk_identity, ledger
│   │   ├── data/              ← SQLite + JSONL ledger
│   │   └── storage/           ← content-addressed blobs
│   ├── tests/
│   └── requirements.txt
├── frontend/                  ← Next.js 14 App Router
│   └── app/                   ← /, /verify, /vault, /memorial, /aid, /kiosk, /map
├── iot/
│   ├── firmware/              ← ESP32 Arduino .ino
│   └── tinkercad/             ← Wiring diagram + component list
├── docs/
│   ├── architecture.md
│   ├── judge-qa.md            ← Answers to the 10 hard test cases
│   └── pitch/                 ← Pitch deck markdown
└── scripts/
    └── verify_endpoints.ps1    ← Smoke-test all routes
```

---

## 🧪 Judge Test Cases — All 10 Covered

See [`docs/judge-qa.md`](docs/judge-qa.md) for the full Q&A against the 10 hard test cases in the spec.

| # | Edge Case | Status |
|---|---|---|
| 1 | Blackout EXIF desync → shadow cross-reference | ✅ |
| 2 | Deepfake submission → SYNTHETIC_MEDIA_DETECTED | ✅ |
| 3 | Cropped duplicate → perceptual-hash match | ✅ |
| 4 | Kiosk offline → SD buffer + amber LED | ✅ |
| 5 | SQL injection → parameterized + sanitized | ✅ |
| 6 | Takedown attempt → IPFS CID persists | ✅ |
| 7 | Anonymous aid → ZK salted-hash identity | ✅ |
| 8 | Traffic spike → async job queue + rate limit | ✅ |
| 9 | Corrupted RFID → reset + warning beep | ✅ |
| 10 | Sybil/bot flood → IP rate limit + perplexity check | ✅ |

---

## 👥 Team

| Member | Role | Scope |
|---|---|---|
| 1 | AI/ML Lead | Deepfake heuristics, EXIF, CLIP-style dedup |
| 2 | Full-Stack Lead | FastAPI + Next.js, IPFS vault, ledger |
| 3 | Embedded/IoT | ESP32 firmware, Tinkercad, kiosk simulator |
| 4 | UI/UX + Pitch | Figma, design system, pitch deck |

---

## 📜 License

Built for the July Uprising Memorial Hackathon. Released under MIT for reproducibility.
