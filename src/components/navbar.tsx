"use client";

import './navbar.css';
import Link from 'next/link';
import Image from 'next/image';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglass, faCheck, faChevronLeft, faSignOutAlt, faKey } from '@fortawesome/free-solid-svg-icons';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Navbar() {
  const [isHidden, setIsHidden] = useState(() => {
    if (typeof window !== 'undefined') {
      return document.cookie.includes('navbar_hidden=true');
    }
    return false;
  });
  const router = useRouter();

  const initialize = () => {
    setTimeout(() => {
      Array.from(document.getElementsByClassName('navbar')).forEach((el) => {
        (el as HTMLElement).style.transition = 'all 0.3s ease';
      });
    }, 100);
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
      } else if (path === "/unique-code") {
        // Do something if needed, e.g., return true or set state
        document.querySelector('.nav-link.unique-code')?.classList.add('active');
        return true;
      }
    }
    return false;
  };

  useEffect(() => {
    initialize();
  });

  const handleToggle = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.cookie = "navbar_hidden=" + (!isHidden);
    setIsHidden(!isHidden);
  };

  const handleTouchToggle = (e: React.TouchEvent) => {
    e.preventDefault();
    e.stopPropagation();
    document.cookie = "navbar_hidden=" + (!isHidden);
    setIsHidden(!isHidden);
  };

  const handleLogout = async () => {
    try {
      const response = await fetch('/api/logout', {
        method: 'POST',
      });
      
      if (response.ok) {
        // Redirect to login page
        router.push('/login');
      }
    } catch (error) {
      console.error('Logout error:', error);
      // Still redirect to login page even if logout fails
      router.push('/login');
    }
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
            <FontAwesomeIcon icon={faHourglass} className="icon-fa" /> 
            <span>Pending</span>
          </Link>
        </li>
        <li>
          <Link href="/finished" className="nav-link finished">
            <FontAwesomeIcon icon={faCheck} className="icon-fa" /> 
            <span>Finished</span>
          </Link>
        </li>
        <li>
          <Link href="/unique-code" className="nav-link unique-code">
            <FontAwesomeIcon icon={faKey} className="icon-fa" /> 
            <span>Unique Code</span>
          </Link>
        </li>
      </ul>
      <hr className="border" />
      <ul className="nav-list">
        <li>
          <a onClick={handleLogout} className="nav-link logout">
            <FontAwesomeIcon icon={faSignOutAlt} className="icon-fa" /> 
            <span>Logout</span>
          </a>
        </li>
      </ul>
      <hr className="border" />
      <button 
        className="close-button" 
        onClick={handleToggle}
        onTouchStart={handleTouchToggle}
        type="button"
      >
        <FontAwesomeIcon icon={faChevronLeft} className="icon-fa" />
      </button>
    </nav>
  );
}