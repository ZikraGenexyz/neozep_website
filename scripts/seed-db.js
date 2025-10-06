// Script to seed the database with test data
import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

// Create a connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Sample data
const submissions = [
  {
    nama: 'John Doe',
    nama_toko: 'Toko Sejahtera',
    alamat: 'Jl. Raya Bogor No. 123, Jakarta Timur',
    email: 'john.doe@example.com',
    telepon: '081234567890',
    status: 'pending',
    video_url: null
  },
  {
    nama: 'Jane Smith',
    nama_toko: 'Toko Makmur',
    alamat: 'Jl. Sudirman No. 45, Jakarta Pusat',
    email: 'jane.smith@example.com',
    telepon: '089876543210',
    status: 'pending',
    video_url: null
  },
  {
    nama: 'Ahmad Rizki',
    nama_toko: 'Toko Bahagia',
    alamat: 'Jl. Gatot Subroto No. 67, Jakarta Selatan',
    email: 'ahmad.rizki@example.com',
    telepon: '087654321098',
    status: 'pending',
    video_url: null
  },
  {
    nama: 'Siti Nurhaliza',
    nama_toko: 'Toko Sentosa',
    alamat: 'Jl. Thamrin No. 89, Jakarta Pusat',
    email: 'siti.nurhaliza@example.com',
    telepon: '082345678901',
    status: 'pending',
    video_url: null
  },
  {
    nama: 'Budi Santoso',
    nama_toko: 'Toko Maju',
    alamat: 'Jl. Pahlawan No. 12, Jakarta Barat',
    email: 'budi.santoso@example.com',
    telepon: '083456789012',
    status: 'pending',
    video_url: null
  }
];

// Seed the database
async function seedDatabase() {
  try {
    console.log('Seeding database...');
    
    // First, clear existing data
    // await pool.query('DELETE FROM submissions');
    
    // Insert sample data
    for (const submission of submissions) {
      await pool.query(
        `INSERT INTO submissions (nama, nama_toko, alamat, email, telepon, status, video_url) 
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          submission.nama,
          submission.nama_toko,
          submission.alamat,
          submission.email,
          submission.telepon,
          submission.status,
          submission.video_url
        ]
      );
    }
    
    console.log('Database seeded successfully with 5 sample submissions');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await pool.end();
  }
}

// Run the seeding
seedDatabase();