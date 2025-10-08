"use client";

import { useState, useEffect, useRef } from "react";
import "./codeTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy } from "@fortawesome/free-solid-svg-icons";

interface UniqueCode {
  id: number;
  code: string;
  is_used: boolean;
  created_at: string;
  used_at?: string;
  submission_id?: number;
}

interface CodeTableProps {
  tableRef?: React.ForwardedRef<{ fetchUniqueCodes: () => Promise<void> }>;
}

export default function CodeTable({ tableRef }: CodeTableProps = {}) {
  // const router = useRouter();
  const [sortColumn, setSortColumn] = useState("created_at");
  const [sortDirection, setSortDirection] = useState("desc");
  const [uniqueCodes, setUniqueCodes] = useState<UniqueCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  // const [uploadingId, setUploadingId] = useState<number | null>(null);
  const [uploadProgress, setUploadProgress] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [rowSpan, setRowSpan] = useState(10);
  const [page, setPage] = useState(1);
  const [rowStart, setRowStart] = useState(0);
  const [uploadProgressList, setUploadProgressList] = useState<{ id: number, progress: number, uploading: boolean }[]>([]);
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const totalEntries = uniqueCodes.length;
  const totalPages = Math.ceil(totalEntries / rowSpan);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update rowStart when page or rowSpan changes
  useEffect(() => {
    setRowStart((page - 1) * rowSpan);
  }, [page, rowSpan]);

  // Sort submissions when sortColumn or sortDirection changes
  const sortedUniqueCodes = [...uniqueCodes].sort((a, b) => {
    if (sortColumn === 'created_at') {
      // Sort by submission_time as Date
      const aTime = new Date(a.created_at).getTime();
      const bTime = new Date(b.created_at).getTime();
      if (aTime === bTime) return 0;
      const comparison = aTime < bTime ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    } else {
      const aValue = a[sortColumn as keyof UniqueCode] || '';
      const bValue = b[sortColumn as keyof UniqueCode] || '';
      if (aValue === bValue) return 0;
      const comparison = aValue < bValue ? -1 : 1;
      return sortDirection === 'asc' ? comparison : -comparison;
    }
  });

  const handleCopyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
      setToastMessage(null);
      setTimeout(() => {
        setToastMessage('Link copied to clipboard!');
      }, 300);
      
      // Auto-hide after 3 seconds
      toastTimeout.current = setTimeout(() => {
        setToastMessage(null);
      }, 2000);
    } catch (err) {
      console.error('Failed to copy link:', err);
      setToastMessage('Failed to copy link');
      toastTimeout.current = setTimeout(() => setToastMessage(null), 2000);
    }
  };

  // Fetch unique codes from the API
  const fetchUniqueCodes = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/unique-code?status=unused', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      if (!response.ok) {
        throw new Error('Failed to fetch unique codes');
      }
      
      const data = await response.json();

      setUniqueCodes(data.codes || []);
      // Initialize uploadProgressList with id, progress: 0, uploading: false for each unique code
      setUploadProgressList(
        (data.uniqueCodes || []).map((s: { id: number }) => ({
          id: s.id,
          progress: 0,
          uploading: false
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error fetching unique codes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUniqueCodes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Expose fetchSubmissions function via ref
  useEffect(() => {
    if (tableRef) {
      // @ts-expect-error - Using forwardRef with function components
      tableRef.current = {
        fetchUniqueCodes
      };
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tableRef]);
  
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
      const response = await fetch(`/api/unique-codes/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete unique code');
      }
      
      // Remove the submission from the local state
      setUniqueCodes(uniqueCodes.filter(uniqueCode => uniqueCode.id !== id));
      
      fetchUniqueCodes();
    } catch (err) {
      console.error('Error deleting unique code:', err);
      alert('Failed to delete unique code. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <div className="code-table-wrapper-container">
      <div className="code-table-wrapper-header">
        <span>Show</span>
        <select
          value={rowSpan}
          onChange={e => {
            setRowSpan(Number(e.target.value));
            setPage(1); // Optionally reset to first page when changing page size
          }}
          className="code-table-entries-dropdown"
        >
          <option value={10}>10</option>
          <option value={25}>25</option>
          <option value={50}>50</option>
          <option value={100}>100</option>
        </select>
        <span>entries</span>
      </div>
      <div className="code-table-wrapper">
        {/* Hidden file input for video upload */}
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept="video/*"
        />
        
        <table className="code-data-table">
          <thead>
            <tr>
              <th className={getSortClass("no") + " unsortable"}>No</th>
              <th className={getSortClass("created_at")} onClick={() => handleSort("created_at")}>Created At</th>
              <th className={getSortClass("code") + " unsortable"}>Unique Code</th>
              <th className={getSortClass("link") + " unsortable"}>Form Link</th>
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
            ) : uniqueCodes.length === 0 ? (
              <tr>
                <td rowSpan={10} className="no-data">No data available in table</td>
              </tr>
            ) : (
              sortedUniqueCodes.slice(rowStart, rowStart + rowSpan).map((uniqueCode, index) => (
                <tr key={uniqueCode.id}>
                  <td>{rowStart + index + 1}</td>
                  <td>{new Date(uniqueCode.created_at).toLocaleString()}</td>
                  <td>{uniqueCode.code}</td>
                  <td>
                    <div className="code-table-link-container">
                      {window.location.origin}/form/{uniqueCode.code}
                      <div className="code-copy-icon-container">
                        <FontAwesomeIcon icon={faCopy} onClick={() => handleCopyLink(`${window.location.origin}/form/${uniqueCode.code}`)} />
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="code-table-footer">
        <span>Showing {rowStart + 1} to {Math.min(rowStart + rowSpan, totalEntries)} of {totalEntries} entries</span>
        
        <div className="code-pagination">
          <button 
            className="code-pagination-button prev" 
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
                className={`code-pagination-button ${page === i + 1 ? 'active' : ''}`}
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
                className={`code-pagination-button ${page === 1 ? 'active' : ''}`}
                onClick={() => goToPage(1)}
              >
                1
              </button>
              
              {/* Ellipsis or page 2 */}
              {page > 3 && <span className="code-pagination-ellipsis">...</span>}
              
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
                      className={`code-pagination-button ${page === pageNum ? 'active' : ''}`}
                      onClick={() => goToPage(pageNum)}
                    >
                      {pageNum}
                    </button>
                  );
                }
                return null;
              })}
              
              {/* Ellipsis or second-last page */}
              {page < totalPages - 2 && <span className="code-pagination-ellipsis">...</span>}
              
              {/* Last page */}
              <button
                className={`code-pagination-button ${page === totalPages ? 'active' : ''}`}
                onClick={() => goToPage(totalPages)}
              >
                {totalPages}
              </button>
            </>
          )}
          
          <button 
            className="code-pagination-button next" 
            onClick={goToNextPage}
            disabled={page === totalPages || totalPages === 0}
          >
            Next
          </button>
        </div>
      </div>
      {toastMessage && 
        <div className="code-toast-message">{toastMessage}</div>
      }
    </div>
  );
}