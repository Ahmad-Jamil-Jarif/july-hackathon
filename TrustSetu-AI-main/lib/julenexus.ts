import { supabase } from './supabase';
import type { TrustReport } from './trust-types';

// Types for our new tables
export interface VerifiedMedia {
  id: string;
  title: string;
  description?: string;
  ipfs_cid: string;
  ipfs_gateway_url: string;
  file_name: string;
  file_type: string;
  file_size?: number;
  upload_timestamp: string;
  deepfake_score: number;
  exif_data?: Record<string, any>;
  is_verified: boolean;
  uploaded_by?: string;
}

export interface VictimReliefRecord {
  id: string;
  beneficiary_hash: string;
  amount_bdt: number;
  disbursement_status: 'PENDING' | 'PROCESSING' | 'DISBURSED' | 'FAILED';
  transaction_hash?: string;
  disbursement_date?: string;
  description?: string;
  created_at: string;
  updated_at: string;
  created_by?: string;
}

// Media service functions
export class MediaService {
  static async uploadMedia(
    file: File,
    title: string,
    description: string = '',
    userId: string | null = null
  ): Promise<VerifiedMedia> {
    // Upload to Supabase storage first (optional, for backup)
    // Then pin to IPFS
    // For now, we'll directly pin to IPFS

    // In a real implementation, you would:
    // 1. Upload file to temporary storage
    // 2. Pin to IPFS using our pinata service
    // 3. Store metadata in database

    // For this implementation, we'll simulate the IPFS pinning
    // In production, you'd call the /api/pin-ipfs endpoint

    throw new Error('Use the /api/pin-ipfs endpoint directly for file uploads');
  }

  static async getVerifiedMedia(filters?: {
    limit?: number;
    offset?: number;
    verifiedOnly?: boolean;
  }): Promise<{ data: VerifiedMedia[]; count: number }> {
    let query = supabase
      .from('verified_media')
      .select('*', { count: 'exact' });

    if (filters?.verifiedOnly !== undefined) {
      query = query.eq('is_verified', filters.verifiedOnly);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    // Order by newest first
    query = query.order('upload_timestamp', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch verified media: ${error.message}`);
    }

    return { data: data as VerifiedMedia[], count: count || 0 };
  }

  static async getMediaById(id: string): Promise<VerifiedMedia | null> {
    const { data, error } = await supabase
      .from('verified_media')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      throw new Error(`Failed to fetch media: ${error.message}`);
    }

    return data as VerifiedMedia || null;
  }

  static async markAsVerified(id: string): Promise<VerifiedMedia> {
    const { data, error } = await supabase
      .from('verified_media')
      .update({ is_verified: true })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to verify media: ${error.message}`);
    }

    return data as VerifiedMedia;
  }
}

// Victim relief service functions
export class ReliefService {
  static async createReliefRecord(
    beneficiaryHash: string,
    amountBdt: number,
    description: string = '',
    userId: string | null = null
  ): Promise<VictimReliefRecord> {
    const { data, error } = await supabase
      .from('victim_relief_ledger')
      .insert({
        beneficiary_hash: beneficiaryHash,
        amount_bdt: amountBdt,
        description: description,
        disbursement_status: 'PENDING',
        created_by: userId
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create relief record: ${error.message}`);
    }

    return data as VictimReliefRecord;
  }

  static async updateDisbursementStatus(
    id: string,
    status: 'PENDING' | 'PROCESSING' | 'DISBURSED' | 'FAILED',
    transactionHash?: string
  ): Promise<VictimReliefRecord> {
    const updateData: any = {
      disbursement_status: status,
      updated_at: new Date().toISOString()
    };

    if (transactionHash) {
      updateData.transaction_hash = transactionHash;
      updateData.disbursement_date = new Date().toISOString();
    }

    const { data, error } = await supabase
      .from('victim_relief_ledger')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update relief record: ${error.message}`);
    }

    return data as VictimReliefRecord;
  }

  static async getReliefRecords(filters?: {
    limit?: number;
    offset?: number;
    status?: 'PENDING' | 'PROCESSING' | 'DISBURSED' | 'FAILED';
  }): Promise<{ data: VictimReliefRecord[]; count: number }> {
    let query = supabase
      .from('victim_relief_ledger')
      .select('*', { count: 'exact' });

    if (filters?.status) {
      query = query.eq('disbursement_status', filters.status);
    }

    if (filters?.limit) {
      query = query.limit(filters.limit);
    }

    if (filters?.offset) {
      query = query.offset(filters.offset);
    }

    // Order by newest first
    query = query.order('created_at', { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Failed to fetch relief records: ${error.message}`);
    }

    return { data: data as VictimReliefRecord[], count: count || 0 };
  }
}

// Enhanced analysis service that combines traditional trust scoring with deepfake detection
export class AnalysisService {
  /**
   * Analyze media with enhanced deepfake detection
   * This would integrate with our Python AI service in production
   */
  static async analyzeMediaEnhanced(
    file: File,
    textContext: string = ''
  ): Promise<{
    trustScore: number;
    biasScore: number;
    scamProbability: number;
    deepfakeScore: number;
    overallRisk: 'low' | 'medium' | 'high';
    exifData: Record<string, any>;
    mediaDescription: string;
  }> {
    // In a production implementation, this would:
    // 1. Extract EXIF data from the file
    // 2. Send to our Python AI service for deepfake analysis
    // 3. Run traditional text analysis on any accompanying text
    // 4. Combine results for final scoring

    // For now, we'll return mock data showing the structure
    return {
      trustScore: 85,
      biasScore: 20,
      scamProbability: 10,
      deepfakeScore: 15, // Low deepfake score = authentic
      overallRisk: 'low',
      exifData: {
        Make: 'Sample Camera',
        Model: 'Model X',
        ExposureTime: '1/125',
        ISO: '100'
      },
      mediaDescription: 'Analyzed media content'
    };
  }
}