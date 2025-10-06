import { neon, neonConfig } from '@neondatabase/serverless';
import { Pool } from 'pg';

// Configure neon to use fetch API
neonConfig.fetchConnectionCache = true;

// For direct SQL queries using neon
const sql = neon(process.env.DATABASE_URL!);

// For more complex operations using pg Pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Function to execute SQL queries
export async function query(text: string, params?: unknown[]) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('Error executing query', { text, error });
    throw error;
  }
}

// Function for simple SQL queries using neon
export async function execSQL(text: string, params?: unknown[]) {
  try {
    // Using the tagged template literal format that neon expects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return await sql(text as any, params);
  } catch (error) {
    console.error('Error executing SQL', { text, error });
    throw error;
  }
}

// Export both for flexibility
export { sql, pool };