import Navbar from "../components/navbar";
import TableWrapper from "../components/tableWrapper";
import Header from "@/components/header";
import "./styles/layout.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";


export default function Home() {
  return (
    <div className="dashboard-page">
      <div className="main-container">
        <Navbar />
        <div className="content-wrapper">
          <main className="main-content">
            {/* Main content goes here */}
            {/* <div className="header-content"> 
              <div className="header-burger">
                <FontAwesomeIcon icon={faBars} />
              </div>
              <h1 className="header-title">Pending</h1>
            </div> */}
            <Header status="Pending" />
            <div className="table-container">
              <TableWrapper status="pending" />
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