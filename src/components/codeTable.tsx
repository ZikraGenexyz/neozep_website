"use client";

import { useState, useEffect, useRef } from "react";
import "./codeTable.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCopy, faTrash } from "@fortawesome/free-solid-svg-icons";

interface UniqueCode {
  id: number;
  code: string;
  is_copied: boolean;
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
  const [sortColumn, setSortColumn] = useState("status");
  const [sortDirection, setSortDirection] = useState("asc");
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
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);
  const [dropdownPosition, setDropdownPosition] = useState<{ top: number; left: number } | null>(null);
  const totalEntries = uniqueCodes.length;
  const totalPages = Math.ceil(totalEntries / rowSpan);
  const toastTimeout = useRef<NodeJS.Timeout | null>(null);

  // Update rowStart when page or rowSpan changes
  useEffect(() => {
    setRowStart((page - 1) * rowSpan);
  }, [page, rowSpan]);

  // Sort submissions when sortColumn or sortDirection changes
  const sortedUniqueCodes = [...uniqueCodes].sort((a, b) => {
    if (sortColumn === 'status') {
      // Sort by submission_time as Date
      const aTime = a.is_copied ? 1 : 0;
      const bTime = b.is_copied ? 1 : 0;
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

  const handleCopyLink = async (link: string, code: string) => {
    try {
      await navigator.clipboard.writeText(link);
      if (toastTimeout.current) {
        clearTimeout(toastTimeout.current);
      }
      setToastMessage(null);

      const response = await fetch('/api/unique-code/set-copied', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code, is_copied: true }),
      });

      if (!response.ok) {
        throw new Error('Failed to set unique code as copied ');
      }
      
      setUniqueCodes(prev =>
        prev.map(uniqueCode =>
          uniqueCode.code === code
            ? { ...uniqueCode, is_copied: true }
            : uniqueCode
        )
      );

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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (openDropdownId !== null) {
        const target = event.target as HTMLElement;
        if (!target.closest('.code-status-dropdown')) {
          setOpenDropdownId(null);
        }
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [openDropdownId]);
  
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
  
  // Handle status change
  const handleStatusChange = async (id: number, newStatus: boolean) => {
    setActionLoading(id);
    try {
      const response = await fetch('/api/unique-code/set-copied', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          code: uniqueCodes.find(uc => uc.id === id)?.code, 
          is_copied: newStatus 
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update status');
      }
      
      // Update the unique code in the local state
      setUniqueCodes(uniqueCodes.map(uniqueCode => 
        uniqueCode.id === id ? { ...uniqueCode, is_copied: newStatus } : uniqueCode
      ));
      
      setOpenDropdownId(null);
    } catch (err) {
      console.error('Error updating status:', err);
      alert('Failed to update status. Please try again.');
    } finally {
      setActionLoading(null);
    }
  };

  // Handle delete
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const handleDelete = async (id: number, code: string) => {
    if (!confirm('Are you sure you want to delete this unique code?')) {
      return;
    }
    
    setActionLoading(id);
    try {
      const response = await fetch(`/api/unique-code`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: code }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete unique code');
      }
      
      // Remove the submission from the local state
      setUniqueCodes(uniqueCodes.filter(uniqueCode => uniqueCode.id !== id));
      
      // fetchUniqueCodes();
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
              <th className={getSortClass("status")} onClick={() => handleSort("status")}>Status</th>
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
                  <td>
                    <div className="code-status-dropdown">
                      <span 
                        className={`code-status-badge code-status-${uniqueCode.is_copied ? 'copied' : 'unused'}`}
                        onClick={(e) => {
                          const rect = e.currentTarget.getBoundingClientRect();
                          setDropdownPosition({
                            top: rect.bottom + 4,
                            left: rect.left
                          });
                          setOpenDropdownId(openDropdownId === uniqueCode.id ? null : uniqueCode.id);
                        }}
                        style={{ cursor: 'pointer' }}
                      >
                        {uniqueCode.is_copied ? 'Copied' : 'Unused'}
                      </span>
                      {openDropdownId === uniqueCode.id && (
                        <div 
                          className="code-status-dropdown-content"
                          style={{
                            position: 'fixed',
                            top: dropdownPosition?.top,
                            left: dropdownPosition?.left,
                          }}
                        >
                          <button 
                            className="code-dropdown-item"
                            onClick={() => handleStatusChange(uniqueCode.id, false)}
                            disabled={actionLoading === uniqueCode.id || !uniqueCode.is_copied}
                          >
                            Unused
                          </button>
                          <button 
                            className="code-dropdown-item"
                            onClick={() => handleStatusChange(uniqueCode.id, true)}
                            disabled={actionLoading === uniqueCode.id || uniqueCode.is_copied}
                          >
                            Copied
                          </button>
                        </div>
                      )}
                    </div>
                  </td>
                  <td>{uniqueCode.code}</td>
                  <td>
                    <div className="code-table-link-container">
                      {window.location.origin}/form/{uniqueCode.code}
                      <div className="code-action-buttons">
                        <div className="code-action-btn copy" onClick={() => handleCopyLink(`${window.location.origin}/form/${uniqueCode.code}`, uniqueCode.code)}>
                          <FontAwesomeIcon icon={faCopy}/>
                        </div>
                        <div className="code-action-btn delete" onClick={() => handleDelete(uniqueCode.id, uniqueCode.code)}>
                          <FontAwesomeIcon icon={faTrash} />
                        </div>
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
            Prev
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