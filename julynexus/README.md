# JulyNexus

An AI-powered platform for preserving truth and dignity during and after mass movements, inspired by the July Uprising (2024).

## Overview

JulyNexus addresses three critical societal crises during and after historic mass movements:
1. **Epistemic Erosion & Information Warfare** - Combat deepfakes and disinformation
2. **Loss of Truth & Unverifiable Historical Evidence** - Preserve authentic media with cryptographic provenance
3. **Inefficient Citizen Support & Dignity Deficit** - Transparent aid distribution with privacy protection

## System Architecture

```
[ Citizen App / IoT Kiosk ] ────> [ Cloudflare Edge / WAF ]
                                          │
                                          ▼
                                [ API Gateway (Node.js) ]
                                          │
        ┌────────────────────────────────┼────────────────────────────────┐
        ▼                                ▼                                ▼
[ FastAPI AI Engine ]          [ Web3 IPFS Controller ]        [ Database & Vector ]
  ├── Deepfake Detector          ├── Pinata IPFS Node            ├── Supabase Postgres
  ├── Metadata Extractor         └── Smart Contract Ledger       └── pgvector Embeddings
  └── CLIP Deduplicator
```

## Components

### 1. AI Fact-Check & Forensics Engine (`ai-engine/`)
- **Technology**: Python FastAPI
- **Capabilities**:
  - Deepfake detection using ML models
  - EXIF metadata extraction
  - File hash calculation for duplicate detection
  - Comprehensive media authenticity analysis
- **Endpoints**:
  - `POST /api/v1/analyze/image` - Analyze images
  - `POST /api/v1/analyze/video` - Analyze videos
  - `GET /health` - Health check

### 2. Web Application (`web-app/` - Enhanced TrustSetu-AI)
- **Technology**: Next.js 14 (App Router), TypeScript, Tailwind CSS
- **Features**:
  - Media upload and verification interface
  - IPFS-powered immutable archive (Memorial Vault)
  - Transparent victim aid ledger
  - Integration with AI forensics engine
  - PDF report generation

### 3. Decentralized Storage & Ledger
- **IPFS via Pinata**: Permanent, censorship-resistant storage for verified media
- **Supabase PostgreSQL**: Structured data for media metadata and aid tracking
- **Database Schema**:
  - `verified_media`: Stores IPFS CIDs, EXIF data, deepfake scores
  - `victim_relief_ledger`: Tracks aid disbursements with privacy protection
  - `media_provenance`: Stores C2PA provenance data

### 4. IoT Civic Dignity Kiosk (`iot-kiosk/`)
- **Technology**: Arduino Uno with LCD, RFID, PIR sensor, buttons
- **Features**:
  - Offline-first operation during internet blackouts
  - RFID martyr tribute cards
  - Emergency reporting button
  - Visual and audio feedback systems
  - Local data storage with sync capabilities

## Setup Instructions

### Prerequisites
- Node.js 18+
- Python 3.10+
- Supabase account
- Pinata account (for IPFS)
- Arduino IDE (for kiosk firmware)

### Backend (AI Forensics Engine)
```bash
cd ai-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### Frontend (Web Application)
```bash
cd ../TrustSetu-AI-main  # Enhanced version of existing TrustSetu-AI
npm install
npm run dev
```

### IoT Kiosk
1. Upload `kiosk_controller.ino` to Arduino Uno using Arduino IDE
2. Wire components according to the schematic in documentation
3. Test functionality

## Key Features

### AI Forensics
- Detects deepfakes and synthetic media
- Extracts and preserves EXIF metadata
- Calculates perceptual hashes for duplicate detection
- Provides authenticity scores and detailed reports

### Immutable Archive
- All verified media pinned to IPFS via Pinata
- Content-addressed storage prevents tampering
- Gateway URLs for easy access
- Integration with blockchain-style provenance tracking

### Transparent Aid System
- Zero-knowledge beneficiary identification
- Publicly auditable disbursement ledger
- Real-time status tracking (Pending/Processing/Disbursed/Failed)
- Protection against fraud and corruption

### Offline Resilience
- IoT kiosk operates during internet blackouts
- Local data storage with automatic sync when connectivity restored
- Emergency reporting capability without network
- Solar/battery power options for extended operation

## Data Privacy & Security

- Beneficiary identities protected via hashing
- No personal data stored in public blockchain/IPFS
- GDPR-compliant data handling options
- Secure key management for cryptographic operations
- Regular security audits and penetration testing

## Deployment

### Docker (Recommended for Production)
```bash
# AI Engine
docker build -t julynexus-ai ./ai-engine
docker run -p 8000:8000 julynexus-ai

# Web App (next.js)
docker build -t julynexus-web ./TrustSetu-AI-main
docker run -p 3000:3000 julynexus-web
```

### Environment Variables
Create `.env` files for both services with:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `PINATA_JWT` for IPFS pinning
- Other service-specific configurations

## API Documentation

### AI Engine Endpoints
- `POST /api/v1/analyze/image` - Analyze uploaded image
- `POST /api/v1/analyze/video` - Analyze uploaded video
- `GET /health` - Service health status

### Web Application Routes
- `/verify` - Media upload and verification
- `/vault` - Explore verified media archive
- `/ledger` - View transparent aid distribution
- `/report` - Generate trust reports

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## License

MIT License - see LICENSE file for details

## Acknowledgments

- Inspired by the resilience of July Uprising (2024) participants
- Built with open-source technologies: Next.js, FastAPI, IPFS, Supabase, Arduino
- Dedicated to preserving truth and promoting dignity in times of crisis