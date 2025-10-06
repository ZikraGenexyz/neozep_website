"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faDownload } from "@fortawesome/free-solid-svg-icons";
import "./csvbutton.css";

interface Submission {
  id: number;
  submission_time: string;
  nama: string;
  nama_toko: string;
  alamat: string;
  email: string;
  telepon: string;
  status: 'pending' | 'finished' | 'rejected';
  video_url?: string;
}

interface CSVDownloaderProps {
  status?: string;
  className?: string;
  style?: React.CSSProperties;
}

export default function CSVDownloader({ status, className = "download-csv-button", style }: CSVDownloaderProps) {
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);

  // Fetch submissions from the API
  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        let url = '/api/submissions';
        if (status) {
          url += `?status=${status}`;
        }
        
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error('Failed to fetch submissions');
        }
        
        const data = await response.json();
        setSubmissions(data.submissions || []);
      } catch (err) {
        console.error('Error fetching submissions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Function to download submissions as CSV
  const downloadCSV = () => {
    if (submissions.length === 0) {
      alert('No data available to download');
      return;
    }

    // Define CSV headers
    const headers = [
      'No',
      'Submission Time',
      'Nama',
      'Nama Toko',
      'Alamat',
      'Email',
      'Telepon',
      'Status',
      'Video URL'
    ];
    
    // Convert submissions to CSV rows
    const csvRows = [
      headers.join(','), // Add headers as first row
      ...submissions.map((submission, index) => {
        return [
          index + 1,
          new Date(submission.submission_time).toLocaleString().replace(', ', ' - '),
          `"${submission.nama.replace(/"/g, '""')}"`, // Escape quotes in CSV
          `"${submission.nama_toko.replace(/"/g, '""')}"`,
          `"${submission.alamat.replace(/"/g, '""')}"`,
          submission.email,
          submission.telepon,
          submission.status,
          submission.video_url || ''
        ].join(',');
      })
    ];
    
    // Create CSV content
    const csvContent = csvRows.join('\n');
    
    // Create a Blob with the CSV content
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    
    // Create a download link
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    // Set link properties
    link.setAttribute('href', url);
    link.setAttribute('download', `neozep-submissions-${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    
    // Add link to document, trigger click, and remove it
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <button 
      className={className}
      style={style}
      onClick={downloadCSV}
      disabled={loading || submissions.length === 0}
    >
      <FontAwesomeIcon icon={faDownload} />
      Download CSV
    </button>
  );
}
