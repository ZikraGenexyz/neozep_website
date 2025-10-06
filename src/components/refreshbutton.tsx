"use client";

import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import "./refreshbutton.css";

interface RefreshButtonProps {
  className?: string;
  style?: React.CSSProperties;
  loading?: boolean;
  onRefresh?: () => void;
}

export default function RefreshButton({ className = "refresh-button", style, loading, onRefresh }: RefreshButtonProps) {
  const [isSpinning, setIsSpinning] = useState(false);
  
  const handleClick = () => {
    setIsSpinning(true);
    
    // Call the refresh function or reload the page
    if (onRefresh) {
      onRefresh();
    } else {
      window.location.reload();
    }
    
    // Stop spinning after 1 second (adjust as needed)
    setTimeout(() => {
      setIsSpinning(false);
    }, 1000);
  };
  
  return (
    <button 
      className={`${className} ${isSpinning ? 'spinning' : ''}`}
      style={style}
      onClick={handleClick}
      disabled={loading || isSpinning}
    >
      <FontAwesomeIcon icon={faRefresh} className="icon" />
      Refresh
    </button>
  );
}