"use client";

import { useRef, useState } from "react";
import CodeTable from "./codeTable";
import RefreshButton from "./refreshbutton";
import GenerateButton from "./generatebutton";

interface TableWrapperProps {
  status?: string;
}

export default function TableWrapper({ status }: TableWrapperProps) {
  const tableRef = useRef<{ fetchUniqueCodes: () => Promise<void>}>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerate = async () => {
    if (tableRef.current) {
      setIsGenerating(true);

      try {
        const response = await fetch('/api/unique-code', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ count: 1, length: 24 }),
        });
        if (!response.ok) {
          throw new Error('Failed to generate unique codes');
        }
        const data = await response.json();
        console.log('Generated unique codes:', data);
      } catch (error) {
        console.error('Error generating unique codes:', error);
      }

      await tableRef.current.fetchUniqueCodes();
      
      setIsGenerating(false);
    }
  };
  
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
          <GenerateButton onGenerate={handleGenerate} loading={isGenerating} />
          <RefreshButton loading={isRefreshing} onRefresh={handleRefresh} />
        </div>
      </div>
      <div className="table-content">
        <CodeTable tableRef={tableRef} />
      </div>
    </>
  );
}
