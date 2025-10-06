"use client";

import './navbar.css';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglass, faCheck, faChevronLeft } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isHidden, setIsHidden] = useState(false);

  const initialize = () => {
    // Check if the current URL path is "/" or "/finished"
    if (typeof window !== "undefined") {
      const path = window.location.pathname;
      if (path === "/") {
        // Do something if needed, e.g., return true or set state
        document.querySelector('.nav-link.pending')?.classList.add('active');
        return true;
      } else if (path === "/finished") {
        // Do something if needed, e.g., return true or set state
        document.querySelector('.nav-link.finished')?.classList.add('active');
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    initialize();
  });

  const handleToggle = () => {
    setIsHidden(!isHidden);
  };

  useEffect(() => {
    document.querySelector('.navbar')?.classList.toggle('hidden', isHidden);
    document.querySelector('.content-wrapper')?.classList.toggle('expanded', isHidden);
  }, [isHidden]);

  return (
    <nav className="navbar">
      <div className="logo-container">
        <Image src="/neozep_logo.png" alt="Neozep" className="logo" width={150} height={40} />
      </div>
      <hr className="border" />
      <ul className="nav-list">
        <li>
          <Link href="/" className="nav-link pending">
            <FontAwesomeIcon icon={faHourglass} className="icon-fa" /> Pending
          </Link>
        </li>
        <li>
          <Link href="/finished" className="nav-link finished">
            <FontAwesomeIcon icon={faCheck} className="icon-fa" /> Finished
          </Link>
        </li>
      </ul>
      <hr className="border" />
      <div className="close-button" onClick={handleToggle}>
        <FontAwesomeIcon icon={faChevronLeft} className="icon-fa" />
      </div>
    </nav>
  );
}

