-- Schema for Neozep submissions database

-- Create submissions table
CREATE TABLE IF NOT EXISTS submissions (
  id SERIAL PRIMARY KEY,
  submission_time TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  nama VARCHAR(255) NOT NULL,
  nama_toko VARCHAR(255) NOT NULL,
  alamat TEXT NOT NULL,
  email VARCHAR(255) NOT NULL,
  telepon VARCHAR(50) NOT NULL,
  status VARCHAR(50) DEFAULT 'pending',
  video_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on submission_time for faster sorting
CREATE INDEX IF NOT EXISTS idx_submissions_time ON submissions(submission_time);

-- Create index on status for filtering
CREATE INDEX IF NOT EXISTS idx_submissions_status ON submissions(status);

-- Create users table for admin authentication
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  is_admin BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create index on username for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);