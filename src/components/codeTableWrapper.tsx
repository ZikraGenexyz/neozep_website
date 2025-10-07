"use client";

import { useRef, useState } from "react";
import CodeTable from "./codeTable";
import RefreshButton from "./refreshbutton";
import CSVDownloader from "./csvbutton";

interface TableWrapperProps {
  status?: string;
}

export default function TableWrapper({ status }: TableWrapperProps) {
  const tableRef = useRef<{ fetchUniqueCodes: () => Promise<void> }>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const handleRefresh = async () => {
    if (tableRef.current) {
      setIsRefreshing(true);
      try {
        await tableRef.current.fetchUniqueCodes();
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
        <span className="table-title">Unique Codes</span>
        <div className="table-title-buttons">
          {/* <CSVDownloader style={{ visibility: status === "pending" ? "hidden" : "visible" }} status={status} /> */}
          <RefreshButton loading={isRefreshing} onRefresh={handleRefresh} />
        </div>
      </div>
      <div className="table-content">
        <CodeTable tableRef={tableRef} />
      </div>
    </>
  );
}
