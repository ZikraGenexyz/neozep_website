"use client";

import { useState } from "react";
import "./table.css";

export default function DataTable() {
  const [sortColumn, setSortColumn] = useState("");
  const [sortDirection, setSortDirection] = useState("asc");
  const colSpan = 10;
  const colStart = 0;
  const totalEntries = 0;

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

  return (
    <div className="table-wrapper">
      <span>Show {colSpan} entries</span>
      <table className="data-table">
        <thead>
          <tr>
            <th className={getSortClass("no")} onClick={() => handleSort("no")}>No</th>
            <th className={getSortClass("time")} onClick={() => handleSort("time")}>Submission Time</th>
            <th className={getSortClass("nama")} onClick={() => handleSort("nama")}>Nama</th>
            <th className={getSortClass("toko")} onClick={() => handleSort("toko")}>Nama Toko</th>
            <th className={getSortClass("alamat")} onClick={() => handleSort("alamat")}>Alamat</th>
            <th className={getSortClass("email")} onClick={() => handleSort("email")}>Email</th>
            <th className={getSortClass("telepon")} onClick={() => handleSort("telepon")}>Telepon</th>
            <th className={getSortClass("status")} onClick={() => handleSort("status")}>Status</th>
            <th className={getSortClass("video")} onClick={() => handleSort("video")}>Video</th>
            <th className={getSortClass("action")} onClick={() => handleSort("action")}>Action</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td colSpan={10} className="no-data">No data available in table</td>
          </tr>
        </tbody>
      </table>
      <span>Showing {colStart} to {colStart + colSpan} of {totalEntries} entries</span>
    </div>
  );
}
