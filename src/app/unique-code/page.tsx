import Navbar from "../../components/navbar";
import "../styles/layout.css";
import CodeTableWrapper from "@/components/codeTableWrapper";

export default function FinishedPage() {
    return (
        <div className="dashboard-page">
            <div className="main-container">
                <Navbar />
                <div className="content-wrapper">
                    <main className="main-content">
                        {/* Main content goes here */}
                        <h1 className="header-title">Unique Codes</h1>
                        <div className="table-container">
                            <CodeTableWrapper status="finished" />
                        </div>
                    </main>
                    <footer className="footer">
                        <div className="footer-content">
                            &copy; {new Date().getFullYear()} Neozep. All rights reserved.
                        </div>
                    </footer>
                </div>
            </div>
        </div>
    );
}