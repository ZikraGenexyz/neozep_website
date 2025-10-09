"use client";

import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBars } from "@fortawesome/free-solid-svg-icons";
import "./header.css";

export default function Header({ status }: { status: string }) {
  function toggleNavbar() {
    document.querySelector('.navbar')?.classList.toggle('hidden');
    document.querySelector('.content-wrapper')?.classList.toggle('expanded');
  }

  return (
    <div className="header-content">
      <div className="header-burger">
        <FontAwesomeIcon icon={faBars} onClick={toggleNavbar} />
      </div>
      <h1 className="header-title">{status}</h1>
      {/* <FontAwesomeIcon icon={faBars} style={{visibility: 'hidden'}} /> */}
    </div>
  );
}