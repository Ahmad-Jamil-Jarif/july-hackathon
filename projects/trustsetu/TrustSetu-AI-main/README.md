# 🚀 TrustSetu

### Bridging Truth and Trust using AI

TrustSetu is an AI-powered platform that analyzes the credibility of text, images, and videos using Retrieval-Augmented Generation (RAG), bias detection, scam detection, and real-time evidence.

---

## 🔥 Features

- ✅ RAG-based evidence retrieval (BM25 + optional FAISS)
- ✅ Bias detection using linguistic analysis
- ✅ Scam detection heuristics
- ✅ Real-time news verification (NewsAPI)
- ✅ Video frame extraction (FFmpeg)
- ✅ Downloadable PDF trust reports
- ✅ Explainable AI scoring system

---

## 🧠 How It Works

1. User inputs text / image / video  
2. Claims are extracted  
3. Evidence is retrieved from:
   - Trusted sources (WHO, RBI, etc.)
   - News APIs  
4. System evaluates:
   - Trust score  
   - Bias score  
   - Scam likelihood  
5. Final explainable report is generated  

---

## 🛠️ Tech Stack

- Frontend: Next.js  
- Backend: Node.js  
- Retrieval: BM25 + FAISS (optional)  
- External APIs: NewsAPI  
- Media Processing: FFmpeg  
- PDF Generation: jsPDF  

---

## ⚙️ Setup Instructions

```bash
npm install
npm run dev
