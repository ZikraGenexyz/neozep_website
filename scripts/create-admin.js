// Script to create admin user
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import { Pool } from 'pg';

dotenv.config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

async function createAdminUser() {
  try {
    // Default admin credentials - in production, use environment variables
    const username = process.env.ADMIN_USERNAME || 'admin';
    const password = process.env.ADMIN_PASSWORD || '@Neozep2025';
    
    console.log('Creating admin user...');
    console.log('Username:', username);
    console.log('Password:', password);
    
    // Hash the password
    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);
    
    // Insert user into database
    const result = await pool.query(
      `INSERT INTO users (username, password_hash, is_admin) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [username, password_hash, true]
    );
    
    const user = result.rows[0];
    
    console.log('Admin user created successfully:', {
      id: user.id,
      username: user.username,
      is_admin: user.is_admin
    });
  } catch (error) {
    console.error('Error creating admin user:', error);
  } finally {
    await pool.end();
  }
}

// Run the script
createAdminUser();
