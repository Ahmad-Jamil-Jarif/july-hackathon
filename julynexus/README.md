# JulyDigonto

<div align="center">

<p>
  <img src="https://img.shields.io/badge/AI%20for%20Truth-Enabled-2563eb?style=for-the-badge" alt="AI for truth" />
  <img src="https://img.shields.io/badge/FastAPI-Backend-009688?style=for-the-badge" alt="FastAPI backend" />
  <img src="https://img.shields.io/badge/Next.js-Frontend-000000?style=for-the-badge" alt="Next.js frontend" />
</p>

   <h3>An AI-powered civic platform for preserving truth, evidence, and dignity during crises.</h3>

<p>JulyDigonto helps transform raw citizen evidence into structured, verifiable insights for journalists, NGOs, aid workers, and communities.</p>

</div>

---

## Problem

During mass movements, emergencies, and periods of unrest, critical evidence often arrives as scattered uploads, screenshots, video clips, and text reports. That information is frequently:

- hard to verify quickly
- difficult to organize under pressure
- vulnerable to misinformation and manipulation
- disconnected from transparent aid and memorial workflows

JulyDigonto addresses this by combining AI analysis, civic reporting tools, and transparent recordkeeping in one platform.

---

## Solution

JulyDigonto brings together a full workflow that allows users to:

- upload and analyze media for trust and risk signals
- review structured claim-level analysis
- preserve testimonies in a memorial archive
- monitor aid-related activity through a transparent ledger
- interact with a civic guidance assistant
- use an offline-ready IoT kiosk concept for field reporting

The result is a practical system for turning messy evidence into structured action.

---

## Key features

- AI-assisted media analysis for images and text
- Trust scoring across risk, bias, deepfake, and scam indicators
- Claim-level evidence summaries and verdicts
- Memorial archive for testimonies and historical memory
- Transparent aid ledger and dashboard experience
- Civic chatbot for rights, evidence, and support guidance
- IoT kiosk prototype for offline civic interaction
- FastAPI backend with Next.js frontend for rapid iteration

---

## Project structure

```text
julynexus/
├── backend/                # FastAPI API and services
│   ├── app/                # Main application code, routes, schemas, security
│   ├── tests/              # Backend tests
│   └── requirements.txt
├── frontend/               # Next.js web application
│   ├── app/                # App router pages and views
│   ├── components/         # Reusable UI and feature components
│   └── lib/                # API and utility helpers
├── iot-kiosk/              # Arduino-style kiosk prototype
├── iot/                    # Supporting IoT assets
├── scripts/                # Utility scripts and payload helpers
└── README.md               # Project overview
```

---

## Tech stack

### Backend
- Python
- FastAPI
- Pydantic
- SQLAlchemy

### Frontend
- Next.js 14
- React
- TypeScript
- Tailwind CSS
- Radix UI
- Lucide React

### Supporting tools
- Axios
- MapLibre
- Framer Motion
- Arduino-compatible IoT prototype

---

## Workflow

```text
User input
   ↓
Media / text analysis
   ↓
Structured trust insights
   ↓
Memorial, ledger, and civic reporting views
```

The platform is designed to support a smooth pipeline from evidence intake to public-facing insight.

---

## Quick start

### 1. Prerequisites

- Python 3.10+
- Node.js 18+
- npm
- Optional: virtual environment for Python

### 2. Backend setup

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\Activate.ps1
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Backend docs will be available at:
- http://localhost:8000/docs
- http://localhost:8000/health

### 3. Frontend setup

```bash
cd frontend
npm install
npm run dev
```

Open http://localhost:3000

### 4. Run tests

```bash
cd backend
pytest -q
```

---

## Main routes and experiences

- /analyze — run trust and claim analysis
- /verify — verify uploaded media and evidence
- /vault — browse archived evidence and memorial content
- /ledger — view aid and transparency data
- /chatbot — civic guidance assistant
- /dashboard — overview of operations and status
- /memorial — memorial and testimony experiences
- /map — explore civic and incident geography

---

## Development notes

- The backend exposes a REST API centered around analysis, verification, memorial, aid, and kiosk routes.
- The frontend is a Next.js app router experience with page-level routes for each civic workflow.
- The project is intended for hackathon-style rapid prototyping, but the architecture is structured enough to extend into real-world deployment scenarios.

---

## License

This project is released for civic innovation and demonstration purposes.
