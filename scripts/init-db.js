// Script to initialize the database
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { Pool } from 'pg';

dotenv.config();

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Read the schema file
const schemaPath = path.join(__dirname, '../src/lib/schema.sql');
const schema = fs.readFileSync(schemaPath, 'utf8');

// Initialize the database
async function initializeDatabase() {
  try {
    console.log('Initializing database...');
    await pool.query(schema);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  } finally {
    await pool.end();
  }
}

// Run the initialization
initializeDatabase();