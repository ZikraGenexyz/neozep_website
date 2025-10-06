import Navbar from "../../components/navbar";
import "../styles/layout.css";
import "../styles/finished.css";
import DataTable from "../../components/table";
import CSVDownloader from "../../components/csvDownloader";

export default function FinishedPage() {
    return (
        <div className="main-container">
        <Navbar />
        <div className="content-wrapper">
            <main className="main-content">
            {/* Main content goes here */}
            <h1 className="header-title">Finished</h1>
            <div className="table-container">
                <div className="table-title-container">
                <span className="table-title">Finished Submissions</span>
                <CSVDownloader status="finished" />
                </div>
                <div className="table-content">
                <DataTable status="finished" />
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
