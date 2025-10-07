// Script to generate unique codes
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Generate a random unique code
function generateUniqueCode(length = 8) {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return result;
}

// Check if code already exists
async function codeExists(code) {
  const result = await pool.query('SELECT id FROM unique_codes WHERE code = $1', [code]);
  return result.rows.length > 0;
}

// Create a single unique code
async function createUniqueCode(code) {
  const result = await pool.query(
    `INSERT INTO unique_codes (code, is_used, submission_id) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [code, false, null]
  );
  return result.rows[0];
}

// Create multiple unique codes
async function createMultipleUniqueCodes(count, length = 8) {
  const codes = [];
  
  for (let i = 0; i < count; i++) {
    let code;
    let isUnique = false;
    
    // Generate unique code (avoid duplicates)
    while (!isUnique) {
      code = generateUniqueCode(length);
      const exists = await codeExists(code);
      if (!exists) {
        isUnique = true;
      }
    }
    
    const newCode = await createUniqueCode(code);
    codes.push(newCode);
  }
  
  return codes;
}

async function generateCodes() {
  try {
    console.log('Generating unique codes...');
    
    // Generate 5 unique codes with length 24
    const codes = await createMultipleUniqueCodes(5, 24);
    
    console.log(`✅ Generated ${codes.length} unique codes:`);
    codes.forEach((code, index) => {
      console.log(`${index + 1}. ${code.code} (ID: ${code.id})`);
    });
    
  } catch (error) {
    console.error('❌ Failed to generate unique codes:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

generateCodes();
