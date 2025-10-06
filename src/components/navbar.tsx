"use client";

import { useState } from "react";
import './navbar.css';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHourglass, faCheck, faChevronLeft, faChevronCircleLeft } from '@fortawesome/free-solid-svg-icons';

export default function Navbar() {
  return (
    <nav className="navbar active">
      <img src="/neozep_logo.png" alt="Neozep" className="logo" />
      <ul className="nav-list">
        <li>
          <hr className="border" />
        </li>
        <li>
          <a href="/" className="nav-link">
            <FontAwesomeIcon icon={faHourglass} className="icon-fa" /> Pending
          </a>
        </li>
        <li>
          <a href="/finished" className="nav-link">
            <FontAwesomeIcon icon={faCheck} className="icon-fa" /> Finished
          </a>
        </li>
        <li>
          <hr className="border" />
        </li>
      </ul>
      <div className="close-button" onClick={() => {
        if (document.querySelector('.navbar')?.classList.contains('active')) {
          document.querySelector('.navbar')?.classList.remove('active');
        } else {
          document.querySelector('.navbar')?.classList.add('active');
        }
      }}>
        <FontAwesomeIcon icon={faChevronLeft} className="icon-fa" />
      </div>
    </nav>
  );
}

