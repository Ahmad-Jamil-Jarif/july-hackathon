-- JulyNexus Database Schema
-- Run this in your Supabase SQL editor

-- Table for storing verified media uploaded to IPFS
CREATE TABLE verified_media (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  ipfs_cid TEXT NOT NULL UNIQUE,
  ipfs_gateway_url TEXT NOT NULL,
  file_name TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  upload_timestamp TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  deepfake_score FLOAT NOT NULL, -- 0.0 = authentic, 1.0 = deepfake
  exif_data JSONB,
  is_verified BOOLEAN DEFAULT false,
  uploaded_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for better query performance
CREATE INDEX idx_verified_media_ipfs_cid ON verified_media(ipfs_cid);
CREATE INDEX idx_verified_media_upload_timestamp ON verified_media(upload_timestamp);
CREATE INDEX idx_verified_media_is_verified ON verified_media(is_verified);

-- Table for tracking victim relief and aid disbursements
CREATE TABLE victim_relief_ledger (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  beneficiary_hash TEXT NOT NULL, -- Hash of beneficiary ID for privacy
  amount_bdt NUMERIC(15, 2) NOT NULL, -- Amount in Bangladeshi Taka
  disbursement_status TEXT NOT NULL CHECK (disbursement_status IN ('PENDING', 'PROCESSING', 'DISBURSED', 'FAILED')),
  transaction_hash TEXT, -- Blockchain transaction hash if applicable
  disbursement_date TIMESTAMP WITH TIME ZONE,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL
);

-- Indexes for relief ledger
CREATE INDEX idx_victim_relief_ledger_beneficiary_hash ON victim_relief_ledger(beneficiary_hash);
CREATE INDEX idx_victim_relief_ledger_disbursement_status ON victim_relief_ledger(disbursement_status);
CREATE INDEX idx_victim_relief_ledger_created_at ON victim_relief_ledger(created_at);

-- Table for storing C2PA provenance data (for media authenticity)
CREATE TABLE media_provenance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  media_id UUID REFERENCES verified_media(id) ON DELETE CASCADE,
  c2pa_data JSONB, -- Store C2PA manifest data
  provenance_verified BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Index for provenance table
CREATE INDEX idx_media_provenance_media_id ON media_provenance(media_id);