"use client";

import { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAdd } from "@fortawesome/free-solid-svg-icons";
import "./generatebutton.css";

interface GenerateButtonProps {
  style?: React.CSSProperties;
  className?: string;
  onGenerate?: () => void;
  loading?: boolean;
}

export default function GenerateButton({ className = "generate-button", style, onGenerate, loading }: GenerateButtonProps) {

  return (
    <button 
      className={className}
      style={style}
      onClick={onGenerate}
      disabled={loading}
    >
      <FontAwesomeIcon icon={faAdd} />
      <span>Generate Code</span>
    </button>
  );
}
