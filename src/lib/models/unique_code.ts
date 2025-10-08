import { query } from '../db';

export interface UniqueCode {
  id: number;
  code: string;
  is_used: boolean;
  created_at: Date;
  used_at?: Date;
  submission_id?: number;
}

export interface UniqueCodeInput {
  code: string;
  is_used?: boolean;
  submission_id?: number;
}

// Create a new unique code
export async function createUniqueCode(data: UniqueCodeInput): Promise<UniqueCode> {
  const { code, is_used = false, submission_id } = data;
  
  const result = await query(
    `INSERT INTO unique_codes (code, is_used, submission_id) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [code, is_used, submission_id]
  );
  
  return result.rows[0];
}

// Get all unique codes
export async function getUniqueCodes(): Promise<UniqueCode[]> {
  const result = await query(
    'SELECT * FROM unique_codes ORDER BY created_at DESC'
  );
  return result.rows;
}

// Get unique code by code string
export async function getUniqueCodeByCode(code: string): Promise<UniqueCode | null> {
  const result = await query(
    'SELECT * FROM unique_codes WHERE code = $1',
    [code]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Get unique code by ID
export async function getUniqueCodeById(id: number): Promise<UniqueCode | null> {
  const result = await query(
    'SELECT * FROM unique_codes WHERE id = $1',
    [id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Mark unique code as used
export async function markUniqueCodeAsUsed(code: string, submission_id?: number): Promise<UniqueCode | null> {
  const result = await query(
    `UPDATE unique_codes 
     SET is_used = true, used_at = CURRENT_TIMESTAMP, submission_id = $2
     WHERE code = $1 AND is_used = false
     RETURNING *`,
    [code, submission_id]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Mark unique code as copied
export async function markUniqueCodeAsCopied(code: string, is_copied: boolean): Promise<UniqueCode | null> {
  const result = await query(
    `UPDATE unique_codes 
     SET is_copied = $2
     WHERE code = $1
     RETURNING *`,
    [code, is_copied]
  );
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Get unused unique codes
export async function getUnusedUniqueCodes(): Promise<UniqueCode[]> {
  const result = await query(
    'SELECT * FROM unique_codes WHERE is_used = false ORDER BY created_at ASC'
  );
  return result.rows;
}

// Get used unique codes
export async function getUsedUniqueCodes(): Promise<UniqueCode[]> {
  const result = await query(
    'SELECT * FROM unique_codes WHERE is_used = true ORDER BY used_at DESC'
  );
  return result.rows;
}

// Delete a unique code
export async function deleteUniqueCode(code: string): Promise<boolean> {
  const result = await query('DELETE FROM unique_codes WHERE code = $1', [code]);
  return result.rowCount! > 0;
}

// Generate a random unique code
export function generateUniqueCode(length: number = 8): string {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Create multiple unique codes at once
export async function createMultipleUniqueCodes(count: number, length: number = 8): Promise<UniqueCode[]> {
  const codes: UniqueCode[] = [];
  
  for (let i = 0; i < count; i++) {
    let code: string;
    let isUnique = false;
    
    // Generate unique code (avoid duplicates)
    while (!isUnique) {
      code = generateUniqueCode(length);
      const existing = await getUniqueCodeByCode(code);
      if (!existing) {
        isUnique = true;
      }
    }
    
    const newCode = await createUniqueCode({ code: code! });
    codes.push(newCode);
  }
  
  return codes;
}
