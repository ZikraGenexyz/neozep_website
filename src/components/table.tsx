"use client";

import { useState, useEffect, useRef } from "react";
import "./table.css";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "@/lib/firebase";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlay, faUpload } from "@fortawesome/free-solid-svg-icons";

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
  unique_code?: {
    id: number;
    code: string;
    is_used: boolean;
    is_copied: boolean;
    created_at: string;
    used_at?: string;
  };
}

interface DataTableProps {
  status?: string;
  tableRef?: React.ForwardedRef<{ fetchSubmissions: () => Promise<void> }>;
}

export default function DataTable({ status, tableRef }: DataTableProps = {}) {
  // const router = useRouter();
  const [sortColumn, setSortColumn] = useState("time");
  const [sortDirection, setSortDirection] = useState("desc");
  const [submissions, setSubmissions] = useState<Submission[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rowSpan, setRowSpan] = useState(10);
  const [page, setPage] = useState(1);
  const [rowStart, setRowStart] = useState(0);
  const [uploadProgressList, setUploadProgressList] = useState<{ id: number, progress: number, status: 'idle' | 'uploading' | 'sending' }[]>([]);
  
  const totalEntries = submissions.length;
  const totalPages = Math.ceil(totalEntries / rowSpan);

  // Update rowStart when page or rowSpan changes
  useEffect(() => {
    setRowStart((page - 1) * rowSpan);
  }, [page, rowSpan]);

  // Fetch submissions from the API
  const fetchSubmissions = async () => {
    setLoading(true);
    try {
      // Build URL with proper parameter handling
      const url = new URL('/api/submissions', window.location.origin);
      if (status) {
        url.searchParams.set('status', status);
      }
      url.searchParams.set('withUniqueCode', 'true');
      
      const response = await fetch(url.toString());
      if (!response.ok) {
        throw new Error('Failed to fetch submissions');
      }
      
      const data = await response.json();
      setSubmissions(data.submissions || []);
      // Initialize uploadProgressList with id, progress: 0, uploading: false for each submission
      setUploadProgressList(
        (data.submissions || []).map((s: { id: number }) => ({
          id: s.id,
          progress: 0,
          status: 'idle'
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching submissions:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubmissions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);
  
  // Expose fetchSubmissions function via ref
  useEffect(() => {
    if (tableRef) {
      // @ts-expect-error - Using forwardRef with function components
      tableRef.current = {
        fetchSubmissions
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableRef]);
  
  // Sort submissions when sortColumn or sortDirection changes
  const sortedSubmissions = [...submissions].sort((a, b) => {
    if (sortColumn === 'time') {
      // Sort by submission_time as Date
      const aTime = new Date(a.submission_time).getTime();
      const bTime = new Date(b.submission_time).getTime();
      if (aTime === bTime) return 0;
      const comparison = aTime < bTime ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    } else {
      const aValue = a[sortColumn as keyof Submission] || '';
      const bValue = b[sortColumn as keyof Submission] || '';
      if (aValue === bValue) return 0;
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    }
  });

  const sendVideoEmailLink = async (submissionId: number, videoUrl: string) => {
    try {
      // Get submission data
      const submissionResponse = await fetch(`/api/submissions/${submissionId}`);
      const submissionData = await submissionResponse.json();
      
      const response = await fetch('/api/send-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: submissionData.submission.email,
          subject: `Neozep Video Result - ${submissionData.submission.nama_toko}`,
          videoUrl,
          submissionId,
          submissionData: submissionData.submission,
          code: submissions.find(submission => submission.id === submissionId)?.unique_code?.code || '',
        }),
      });
      
      if (response.ok) {
        console.log('Video email sent successfully');
      }
    } catch (error) {
      console.error('Error sending video email:', error);
    }
  };
  
  const handleSort = (column: string) => {
    if (sortColumn === column) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortColumn(column);
      setSortDirection("asc");
    }
  };
  
  const getSortClass = (column: string) => {
    return sortColumn === column ? `sort-${sortDirection}` : "";
  };
  
  // Pagination functions
  const goToPage = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      setPage(pageNumber);
    }
  };
  
  const goToPreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };
  
  const goToNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };
  
  // Handle delete
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this submission?')) {
      return;
    }
    
    setActionLoading(id);
    try {
      const response = await fetch(`/api/submissions/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete submission');
      }
      
      // Remove the submission from the local state
      setSubmissions(submissions.filter(submission => submission.id !== id));
      
      fetchSubmissions();
    } catch (err) {
      console.error('Error deleting submission:', err);
      alert('Failed to delete submission. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle upload video
  const handleUploadVideo = (submissionId: number) => {
    // Reset file input first
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
      
      // Remove previous event listener before adding a new one
      fileInputRef.current.onchange = null;
      
      // Set new event handler
      fileInputRef.current.onchange = (e) => {
        const event = e as unknown as React.ChangeEvent<HTMLInputElement>;
        handleFileSelect(event, submissionId);
      };
      
      fileInputRef.current.click();
    }
  };

  // Handle file selection
  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>, submissionId: number) => {
    const file = event.target.files?.[0];

    console.log(submissionId);

    setUploadProgressList(prevList => 
      prevList.map(p => p.id === submissionId ? { ...p, status: 'uploading' } : p)
    );
    
    if (!file) {
      setUploadProgressList(prevList => 
        prevList.map(p => p.id === submissionId ? { ...p, status: 'idle' } : p)
      );
      return;
    }

    // Check if file is a video
    if (!file.type.startsWith('video/')) {
      alert('Please select a video file');
      setUploadProgressList(prevList => 
        prevList.map(p => p.id === submissionId ? { ...p, status: 'idle' } : p)
      );
      return;
    }

    setActionLoading(submissionId);
    setUploadProgress(0);

    try {
      const storageRef = ref(storage, `videos/${submissionId}/${file.name}`);
      const uploadTask = uploadBytesResumable(storageRef, file);

      uploadTask.on(
        "state_changed",
        (snapshot) => {
          const percent = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          // setUploadProgress(percent);
          setUploadProgressList(prevList => 
            prevList.map(p => p.id === submissionId ? { ...p, progress: percent } : p)
          );
          
          // When upload reaches 100%, set processing state to true
          if (percent === 100) {
            setIsProcessing(true);
          }
        },
        (error) => {
          console.error("Upload failed:", error);
          alert('Upload failed: ' + error.message);
          setActionLoading(null);
          setUploadProgressList(prevList => 
            prevList.map(p => p.id === submissionId ? { ...p, status: 'idle' } : p)
          );
        },
        async () => {
          try {
            setUploadProgressList(prevList => 
              prevList.map(p => p.id === submissionId ? { ...p, status: 'sending' } : p)
            );
            
            const url = await getDownloadURL(uploadTask.snapshot.ref);

            // Update submission with video URL
            const response = await fetch(`/api/submissions/${submissionId}`, {
              method: 'PATCH',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ video_url: url, status: 'finished' }),
            });
            
            if (!response.ok) {
              throw new Error('Failed to update submission with video URL');
            }

            sendVideoEmailLink(submissionId, url);
            
            // Update the submission in the local state
            setSubmissions(prevSubmissions =>
              prevSubmissions.filter(submission => submission.id !== submissionId)
            );

            // alert('Video uploaded successfully');
            
            // Refresh the data after successful upload
            // fetchSubmissions();
          } catch (error) {
            console.error('Error updating submission:', error);
            alert('Failed to update submission with video URL');
          } finally {
            setActionLoading(null);
            setUploadProgressList(prevList => 
              prevList.map(p => p.id === submissionId ? { ...p, status: 'idle', progress: 0 } : p)
            );
            setUploadProgress(0);
            setIsProcessing(false);
            
            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = '';
              fileInputRef.current.onchange = null;  // Also clear the event handler
            }
          }
        }
      );
    } catch (error) {
      console.error('Error starting upload:', error);
      alert('Error starting upload');
      setActionLoading(null);
      setUploadProgressList(prevList => 
        prevList.map(p => p.id === submissionId ? { ...p, status: 'idle' } : p)
      );
    }
  };

  return (
    <div className="table-wrapper-container">
      <div className="table-wrapper-header">
        <span>Show</span>
        <select
          value={rowSpan}
          onChange={e => {
            setRowSpan(Number(e.target.value));
            setPage(1); // Optionally reset to first page when changing page size
          }}
          className="table-entries-dropdown"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>entries</span>
      </div>
      <div className="table-wrapper">
        {/* Hidden file input for video upload */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="video/*"
        />
        
        {/* Upload progress indicator */}
        {/* {uploadingId !== null && uploadProgress > 0 && uploadProgress < 100 && ( */}
          {/* <div className="upload-progress">
            <div className="progress-bar">
              <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
            </div>
            <div className="progress-text">Uploading: {uploadProgress}%</div>
          </div> */}
        {/* )} */}
        
        {/* Processing indicator (circular loader) */}
        {/* {uploadingId !== null && isProcessing && ( */}
          {/* <div className="upload-progress">
            <div className="circular-loader">
              <div className="spinner"></div>
              <div className="circular-loader-text">Processing video...</div>
            </div>
          </div> */}
        {/* )} */}
        
        <table className="data-table">
          <thead>
            <tr>
              <th className={getSortClass("no") + "unsortable"}>No</th>
              <th className={getSortClass("time")} onClick={() => handleSort("time")}>Submission Time</th>
              <th className={getSortClass("nama")} onClick={() => handleSort("nama")}>Nama</th>
              <th className={getSortClass("toko")} onClick={() => handleSort("toko")}>Nama Toko</th>
              <th className={getSortClass("alamat")} onClick={() => handleSort("alamat")}>Alamat</th>
              <th className={getSortClass("email")} onClick={() => handleSort("email")}>Email</th>
              <th className={getSortClass("telepon") + "unsortable"}>Telepon</th>
              <th className={getSortClass("status") + "unsortable"}>Status</th>
              <th className={getSortClass("video") + "unsortable"}>Video</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td rowSpan={10} className="loading">Loading data...</td>
              </tr>
            ) : error ? (
              <tr>
                <td rowSpan={10} className="error">{error}</td>
              </tr>
            ) : sortedSubmissions.length === 0 ? (
              <tr>
                <td rowSpan={10} className="no-data">No data available in table</td>
              </tr>
            ) : (
              sortedSubmissions.slice(rowStart, rowStart + rowSpan).map((submission, index) => (
                <tr key={submission.id}>
                  <td>{rowStart + index + 1}</td>
                  <td>{new Date(submission.submission_time).toLocaleString()}</td>
                  <td>{submission.nama}</td>
                  <td>{submission.nama_toko}</td>
                  <td>{submission.alamat}</td>
                  <td>{submission.email}</td>
                  <td>{submission.telepon}</td>
                  <td>
                    <div className="status-dropdown">
                      <span className={`status-badge status-${submission.status}`}>
                        {submission.status}
                      </span>
                    </div>
                  </td>
                  <td>
                    {submission.video_url ? (
                      <a
                        className="action-btn play-btn"
                        href={submission.video_url}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <FontAwesomeIcon icon={faPlay} />
                        Open
                      </a>
                    ) : (
                      uploadProgressList.find(p => p.id === submission.id)?.status === 'idle' ? (
                        <button 
                          className="action-btn upload-btn"
                          onClick={() => handleUploadVideo(submission.id)}
                          disabled={actionLoading === submission.id}
                        >
                          <FontAwesomeIcon icon={faUpload} />
                          Upload
                        </button>
                      ) : (
                        <div className="action-btn uploading-btn">
                          <span className="uploading-btn-fill" style={{ width: `${uploadProgressList.find(p => p.id === submission.id)?.progress ?? 0}%` }} />
                          <div className="uploading-btn-text">
                            <div className="spinner"></div>
                            { uploadProgressList.find(p => p.id === submission.id)?.status === 'uploading' ? 'Uploading' : 'Sending'}
                          </div>
                        </div>
                      )
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="table-footer">
        <span>Showing {rowStart + 1} to {Math.min(rowStart + rowSpan, totalEntries)} of {totalEntries} entries</span>
        
        <div className="pagination">
          <button 
            className="pagination-button prev" 
            onClick={goToPreviousPage}
            disabled={page === 1}
          >
            Previous
          </button>
          
          {totalPages <= 7 ? (
            // If we have 7 or fewer pages, show all page numbers
            [...Array(totalPages)].map((_, i) => (
              <button
                key={i}
                className={`pagination-button ${page === i + 1 ? 'active' : ''}`}
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </button>
            ))
          ) : (
            // If we have more than 7 pages, show a subset with ellipsis
            <>
              {/* First page */}
              <button
                className={`pagination-button ${page === 1 ? 'active' : ''}`}
                onClick={() => goToPage(1)}
              >
                1
              </button>
              
              {/* Ellipsis or page 2 */}
              {page > 3 && <span className="pagination-ellipsis">...</span>}
              
              {/* Pages around current page */}
              {[...Array(5)].map((_, i) => {
                // Calculate the page number to display
                let pageNum;
                if (page <= 3) {
                  // Near the start
                  pageNum = i + 2;
                } else if (page >= totalPages - 2) {
                  // Near the end
                  pageNum = totalPages - 5 + i;
                } else {
                  // In the middle
                  pageNum = page - 2 + i;
                }
                
                // Only render if the page number is valid (between 2 and totalPages-1)
                if (pageNum > 1 && pageNum < totalPages) {
                  return (
                    <button
                      key={pageNum}
                      className={`pagination-button ${page === pageNum ? 'active' : ''}`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              {/* Ellipsis or second-last page */}
              {page < totalPages - 2 && <span className="pagination-ellipsis">...</span>}
              
              {/* Last page */}
              <button
                className={`pagination-button ${page === totalPages ? 'active' : ''}`}
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button 
            className="pagination-button next" 
            onClick={goToNextPage}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
