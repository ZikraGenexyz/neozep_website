import fs from 'fs';
import path from 'path';
import { pool } from './db';

// Read the schema file
const schemaPath = path.join(process.cwd(), 'src/lib/schema.sql');
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

// Run the initialization if this file is executed directly
if (require.main === module) {
  initializeDatabase();
}

export default initializeDatabase;
