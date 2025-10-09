import { query } from '../db';

export interface Submission {
  id: number;
  submission_time: Date;
  nama: string;
  nama_toko: string;
  alamat: string;
  email: string;
  telepon: string;
  status: 'pending' | 'finished' | 'rejected';
  video_url?: string;
  created_at: Date;
  updated_at: Date;
}

export interface SubmissionWithUniqueCode extends Submission {
  unique_code?: {
    id: number;
    code: string;
    is_used: boolean;
    is_copied: boolean;
    created_at: Date;
    used_at?: Date;
  };
}

export interface SubmissionInput {
  nama: string;
  nama_toko: string;
  alamat: string;
  email: string;
  telepon: string;
  video_url?: string;
}

// Create a new submission
export async function createSubmission(data: SubmissionInput): Promise<Submission> {
  const { nama, nama_toko, alamat, email, telepon, video_url } = data;
  
  const result = await query(
    `INSERT INTO submissions (nama, nama_toko, alamat, email, telepon, video_url) 
     VALUES ($1, $2, $3, $4, $5, $6) 
     RETURNING *`,
    [nama, nama_toko, alamat, email, telepon, video_url]
  );
  
  return result.rows[0];
}

// Get all submissions with optional status filter
export async function getSubmissions(status?: string): Promise<Submission[]> {
  let sql = 'SELECT * FROM submissions';
  const params: unknown[] = [];
  
  if (status) {
    sql += ' WHERE status = $1';
    params.push(status);
  }
  
  sql += ' ORDER BY submission_time DESC';
  
  const result = await query(sql, params);
  return result.rows;
}

// Get all submissions with their unique codes (JOIN)
export async function getSubmissionsWithUniqueCodes(status?: string): Promise<SubmissionWithUniqueCode[]> {
  let sql = `
    SELECT 
      s.*,
      uc.id as unique_code_id,
      uc.code as unique_code,
      uc.is_used as unique_code_is_used,
      uc.is_copied as unique_code_is_copied,
      uc.created_at as unique_code_created_at,
      uc.used_at as unique_code_used_at
    FROM submissions s
    LEFT JOIN unique_codes uc ON s.id = uc.submission_id
  `;
  const params: unknown[] = [];
  
  if (status) {
    sql += ' WHERE s.status = $1';
    params.push(status);
  }
  
  sql += ' ORDER BY s.submission_time DESC';
  
  const result = await query(sql, params);
  
  // Transform the flat result into nested structure
  const submissionsMap = new Map<number, SubmissionWithUniqueCode>();
  
  result.rows.forEach((row: {
    id: number;
    submission_time: Date;
    nama: string;
    nama_toko: string;
    alamat: string;
    email: string;
    telepon: string;
    status: string;
    video_url?: string;
    created_at: Date;
    updated_at: Date;
    unique_code_id?: number;
    unique_code?: string;
    unique_code_is_used?: boolean;
    unique_code_is_copied?: boolean;
    unique_code_created_at?: Date;
    unique_code_used_at?: Date;
  }) => {
    const submissionId = row.id;
    
    if (!submissionsMap.has(submissionId)) {
      submissionsMap.set(submissionId, {
        id: row.id,
        submission_time: row.submission_time,
        nama: row.nama,
        nama_toko: row.nama_toko,
        alamat: row.alamat,
        email: row.email,
        telepon: row.telepon,
        status: row.status as 'pending' | 'finished' | 'rejected',
        video_url: row.video_url,
        created_at: row.created_at,
        updated_at: row.updated_at,
        unique_code: row.unique_code_id ? {
          id: row.unique_code_id,
          code: row.unique_code || '',
          is_used: row.unique_code_is_used || false,
          is_copied: row.unique_code_is_copied || false,
          created_at: row.unique_code_created_at || new Date(),
          used_at: row.unique_code_used_at
        } : undefined
      });
    }
  });
  
  console.log('Final submissions count:', submissionsMap.size);
  return Array.from(submissionsMap.values());
}

// Get a submission by ID
export async function getSubmissionById(id: number): Promise<Submission | null> {
  const result = await query('SELECT * FROM submissions WHERE id = $1', [id]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Get a submission by ID with its unique code
export async function getSubmissionByIdWithUniqueCode(id: number): Promise<SubmissionWithUniqueCode | null> {
  const result = await query(`
    SELECT 
      s.*,
      uc.id as unique_code_id,
      uc.code as unique_code,
      uc.is_used as unique_code_is_used,
      uc.is_copied as unique_code_is_copied,
      uc.created_at as unique_code_created_at,
      uc.used_at as unique_code_used_at
    FROM submissions s
    LEFT JOIN unique_codes uc ON s.id = uc.submission_id
    WHERE s.id = $1
  `, [id]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  const row = result.rows[0];
  return {
    id: row.id,
    submission_time: row.submission_time,
    nama: row.nama,
    nama_toko: row.nama_toko,
    alamat: row.alamat,
    email: row.email,
    telepon: row.telepon,
    status: row.status,
    video_url: row.video_url,
    created_at: row.created_at,
    updated_at: row.updated_at,
    unique_code: row.unique_code_id ? {
      id: row.unique_code_id,
      code: row.unique_code,
      is_used: row.unique_code_is_used,
      is_copied: row.unique_code_is_copied,
      created_at: row.unique_code_created_at,
      used_at: row.unique_code_used_at
    } : undefined
  };
}

// Update a submission's status
export async function updateSubmissionStatus(id: number, status: 'pending' | 'finished' | 'rejected'): Promise<Submission | null> {
  const result = await query(
    `UPDATE submissions 
     SET status = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [status, id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Update a submission's video URL
export async function updateSubmissionVideoUrl(id: number, videoUrl: string): Promise<Submission | null> {
  const result = await query(
    `UPDATE submissions 
     SET video_url = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2 
     RETURNING *`,
    [videoUrl, id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Delete a submission
export async function deleteSubmission(id: number): Promise<boolean> {
  const result = await query('DELETE FROM submissions WHERE id = $1', [id]);
  return result.rowCount! > 0;
}

export async function getSmallestId(): Promise<number> {
  const result = await query('SELECT MIN(id) FROM submissions');
  return result.rows[0].min;
}