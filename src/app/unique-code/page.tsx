import Navbar from "../../components/navbar";
import "../styles/layout.css";
import CodeTableWrapper from "@/components/codeTableWrapper";
import Header from "@/components/header";

export default function FinishedPage() {
    return (
        <div className="dashboard-page">
            <div className="main-container">
                <Navbar />
                <div className="content-wrapper">
                    <main className="main-content">
                        {/* Main content goes here */}
                        <Header status="Unique Codes" />
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