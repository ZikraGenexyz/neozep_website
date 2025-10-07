// src/lib/models/user.ts
import { query } from '../db';
import bcrypt from 'bcrypt';

export interface User {
  id: number;
  username: string;
  password_hash: string;
  is_admin: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface UserInput {
  username: string;
  password: string;
  is_admin?: boolean;
}

// Create a new user with hashed password
export async function createUser(data: UserInput): Promise<User> {
  const { username, password, is_admin = false } = data;
  
  // Hash the password with bcrypt
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(password, saltRounds);
  
  const result = await query(
    `INSERT INTO users (username, password_hash, is_admin) 
     VALUES ($1, $2, $3) 
     RETURNING *`,
    [username, password_hash, is_admin]
  );
  
  return result.rows[0];
}

// Get a user by username
export async function getUserByUsername(username: string): Promise<User | null> {
  const result = await query('SELECT * FROM users WHERE username = $1', [username]);
  
  if (result.rows.length === 0) {
    return null;
  }
  
  return result.rows[0];
}

// Verify a user's password
export async function verifyPassword(user: User, password: string): Promise<boolean> {
  return bcrypt.compare(password, user.password_hash);
}

// Update a user's password
export async function updatePassword(userId: number, newPassword: string): Promise<boolean> {
  const saltRounds = 10;
  const password_hash = await bcrypt.hash(newPassword, saltRounds);
  
  const result = await query(
    `UPDATE users 
     SET password_hash = $1, updated_at = CURRENT_TIMESTAMP 
     WHERE id = $2`,
    [password_hash, userId]
  );
  
  return result.rowCount! > 0;
}