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

// Get a submission by ID
export async function getSubmissionById(id: number): Promise<Submission | null> {
  const result = await query('SELECT * FROM submissions WHERE id = $1', [id]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
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
