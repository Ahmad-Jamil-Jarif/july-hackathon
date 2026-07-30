# JulyDigonto Demonstration Guide

This guide demonstrates how to showcase the JulyDigonto platform capabilities for the hackathon demo.

## Demo Scenario: Verifying and Preserving Historical Media

### Scenario Overview
During a mass movement, a citizen captures critical video evidence of events. They want to:
1. Verify the authenticity of their media
2. Preserve it immutably for historical record
3. Potentially use it to support victim aid claims
4. Access it through offline kiosks during internet blackouts

## Demo Setup

### 1. Start the AI Forensics Engine
```bash
cd ai-engine
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

### 2. Start the Enhanced Web Application
```bash
cd TrustSetu-AI-main
npm install
npm run dev
```
(Ensure environment variables are set for Supabase and Pinata)

### 3. Prepare Test Media
Use any image or video file as test evidence.

## Demo Flow

### Step 1: Media Verification (AI Forensics)
1. Navigate to the web application's verification page
2. Upload the test media file
3. Observe the analysis process:
   - Deepfake score calculation (0.0 = authentic, 1.0 = deepfake)
   - EXIF metadata extraction (camera settings, timestamps, GPS if available)
   - File hash generation for duplicate detection
   - Overall trust score calculation
4. See the verification result: "Authentic" or "Suspicious"

### Step 2: Decentralized Preservation (IPFS Vault)
1. If authenticated, option to "Preserve to Permanent Archive"
2. System pins file to IPFS via Pinata
3. Receives IPFS Content Identifier (CID)
4. Stores metadata in Supabase database
5. Displays confirmation with IPFS gateway URL
6. Media now accessible via: `https://gateway.pinata.cloud/ipfs/{CID}`

### Step 3: Transparent Aid Tracking (Optional)
1. If media depicts victims needing assistance:
2. Authorized personnel can create aid request
3. System generates privacy-preserving beneficiary hash
4. Tracks disbursement status: Pending → Processing → Disbursed
5. Public ledger shows aggregated aid distribution without exposing PII

### Step 4: Offline Access (IoT Kiosk)
1. During internet blackout, citizens visit physical kiosk
2. Kiosk displays:
  - Welcome message: "JulyDigonto Kiosk - Spirit of July"
   - Motion-activated welcome when approached
   - Memorial content from IPFS cache (pre-loaded)
3. Citizens can:
   - Tap RFID martyr tribute cards to pay respects
   - Press emergency button to log offline reports
   - View scrolling memorial timeline
4. When connectivity returns:
   - Kiosk syncs local logs to central system
   - LED indicators show sync status
   - Audit trail preserved

## Expected Demo Outputs

### AI Analysis Results
```json
{
  "deepfake_score": 0.15,  // Low score = authentic
  "is_authentic": true,
  "trust_score": 85,
  "exif_data": {
    "Make": "Apple",
    "Model": "iPhone 14 Pro",
    "ExposureTime": "1/120",
    "ISOSpeedRatings": "64"
  },
  "file_hash": "a1b2c3d4...",
  "analysis_timestamp": "2024-07-31T10:30:00Z"
}
```

### IPFS Preservation Result
```json
{
  "success": true,
  "ipfsHash": "QmXyZ...",
  "gatewayUrl": "https://gateway.pinata.cloud/ipfs/QmXyZ...",
  "fileName": "evidence.jpg",
  "fileSize": 2457600
}
```

### Aid Ledger Entry (Privacy-Preserving)
```json
{
  "beneficiary_hash": "a7f3c9e2...",  // Hash of actual ID
  "amount_bdt": 5000.00,
  "disbursement_status": "DISBURSED",
  "transaction_hash": "0x742d35...", // Optional blockchain tx
  "disbursement_date": "2024-07-31T14:22:00Z"
}
```

## Talking Points for Judges

### Technical Innovation
- **Hybrid AI + Blockchain Approach**: Combines ML forensics with decentralized storage
- **Privacy-First Design**: Zero-knowledge principles for beneficiary protection
- **Offline-First Philosophy**: Functional during internet blackouts (common in crises)
- **Open Standards**: Uses IPFS, C2PA-ready, GDPR-conscious

### Real-World Impact
- **Historical Preservation**: Prevents erasure of atrocity evidence
- **Accountability**: Transparent aid distribution reduces corruption
- **Empowerment**: Citizens verify truth independently
- **Resilience**: Functions when infrastructure is compromised

### Hackathon Feasibility
- **Modular Design**: Components can be demonstrated independently
- **Working Prototypes**: All subsystems functional (AI, Web, IoT)
- **Clear Integration Path**: Well-defined APIs between components
- **Scalable Architecture**: Cloud-native with edge capabilities

## Troubleshooting

### AI Service Not Responding
1. Check if uvicorn is running on port 8000
2. Verify Python dependencies installed
3. Check firewall settings

### Web Application Issues
1. Confirm environment variables set (SUPABASE_URL, PINATA_JWT)
2. Check npm install completed successfully
3. Verify Next.js development server running on port 3000

### IPFS Pinning Failures
1. Validate Pinata JWT token
2. Check internet connectivity
3. Verify file size limits (Pinata has free tier limits)

### Kiosk Not Functioning
1. Verify Arduino board connection
2. Check wiring against schematic
3. Confirm correct board/port selected in IDE
4. Test individual components with basic sketches

## Success Metrics for Demo

✅ Media authenticated with quantifiable confidence scores  
✅ Content permanently stored on IPFS with verifiable CID  
✅ Aid tracking maintains privacy while ensuring transparency  
✅ Kiosk operates independently during simulated blackout  
✅ All components integrate through well-defined APIs  
✅ User flow demonstrable in under 5 minutes  

## Presentation Tips

1. **Start with the Problem**: Show examples of deepfakes and misinformation from recent events
2. **Demonstrate the Solution**: Walk through the full verification → preservation → access pipeline
3. **Highlight Uniqueness**: Emphasize the combination of AI forensics + decentralized storage + offline access
4. **Show Real Outputs**: Display actual JSON responses, IPFS hashes, and kiosk behavior
5. **Emphasize Impact**: Connect technical features to real-world outcomes for truth preservation and victim support

This demo showcases a production-ready prototype that addresses critical needs in crisis situations while being feasible to build within hackathon constraints.