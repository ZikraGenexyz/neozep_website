"use client";

import { useRef, useState } from "react";
import DataTable from "./table";
import RefreshButton from "./refreshbutton";
import CSVDownloader from "./csvbutton";

interface TableWrapperProps {
  status?: string;
}

export default function TableWrapper({ status }: TableWrapperProps) {
  const tableRef = useRef<{ fetchSubmissions: () => Promise<void> }>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    if (tableRef.current) {
      setIsRefreshing(true);
      try {
        await tableRef.current.fetchSubmissions();
      } finally {
        // Ensure we reset the loading state even if there's an error
        setTimeout(() => {
          setIsRefreshing(false);
        }, 500); // Small delay to ensure animation completes nicely
      }
    }
  };
  
  return (
    <>
      <div className="table-title-container">
        <span className="table-title">{status === "pending" ? "Pending" : "Finished"} Submissions</span>
        <div className="table-title-buttons">
          <CSVDownloader style={{ visibility: status === "pending" ? "hidden" : "visible" }} status={status} />
          <RefreshButton loading={isRefreshing} onRefresh={handleRefresh} />
        </div>
      </div>
      <div className="table-content">
        <DataTable status={status} tableRef={tableRef} />
      </div>
    </>
  );
}
