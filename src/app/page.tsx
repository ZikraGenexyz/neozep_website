import Navbar from "../components/navbar";
import DataTable from "../components/table";
import CSVDownloader from "../components/csvDownloader";
import "./styles/layout.css";

export default function Home() {
  return (
    <div className="main-container">
      <Navbar />
      <div className="content-wrapper">
        <main className="main-content">
          {/* Main content goes here */}
          <h1 className="header-title">Pending</h1>
          <div className="table-container">
            <div className="table-title-container">
              <span className="table-title">Pending Submissions</span>
              <CSVDownloader style={{ visibility: "hidden" }} status="pending" />
            </div>
            <div className="table-content">
              <DataTable status="pending" />
            </div>
          </div>
        </main>
        <footer className="footer">
          <div className="footer-content">
            &copy; {new Date().getFullYear()} Neozep. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
