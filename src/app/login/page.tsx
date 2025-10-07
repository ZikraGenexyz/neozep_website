"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter } from "next/navigation";
import "../styles/layout.css";
import "../styles/login.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";

export default function LoginPage() {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const router = useRouter();

    const handleSubmit = async (e: FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError(null);
        
        try {
            const response = await fetch("/api/login", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ username, password }),
            });
            
            const data = await response.json();
            
            if (response.ok) {
                // Redirect to dashboard on successful login
                router.push('/');
            } else {
                setError(data.message || "Invalid username or password");
            }
        } catch (error) {
            console.error(error);
            setError("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        if (name === "username") {
            setUsername(value);
        } else if (name === "password") {
            setPassword(value);
        }
    }

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    }

    // Check if user is already authenticated and redirect to homepage
    useEffect(() => {
        const checkAuth = async () => {
            try {
                const response = await fetch('/api/auth/check', {
                    method: 'GET',
                    credentials: 'include',
                });
                
                if (response.ok) {
                    // User is already authenticated, redirect to homepage
                    router.push('/');
                }
            } catch (error) {
                // If auth check fails, user is not authenticated, stay on login page
                console.log('User not authenticated, staying on login page');
            }
        };

        checkAuth();
    }, [router]);
    
    return (
        <div className="login-page">
            <div className="main-container">
                <div className="content-wrapper" style={{ maxWidth: '100vw !important' }}>
                    <main className="main-content">
                        <div className="form-page-layout">
                            <div className="form-logo-section">
                                <div className="form-logo-wrapper">
                                    <img src="/neozep_logo.png" alt="Neozep Logo" className="form-logo" />
                                    <span className="form-logo-text">ADMIN PORTAL</span>
                                </div>
                            </div>
                            <div className="form-section">
                                <div className="form-container login-form">
                                    <h1 className="login-title">Admin Login</h1>
                                    <p className="login-subtitle">Enter your credentials to access the dashboard</p>
                                    
                                    {error && (
                                        <div className="form-error">
                                            {error}
                                        </div>
                                    )}
                                    
                                    <form onSubmit={handleSubmit}>
                                        <div className="form-group">
                                            <label htmlFor="username" className="form-label required-field">Username</label>
                                            <input
                                                type="text"
                                                id="username"
                                                name="username"
                                                className="form-input"
                                                value={username}
                                                onChange={handleInputChange}
                                                placeholder="Enter your username"
                                                required
                                            />
                                        </div>

                                        <div className="form-group">
                                            <label htmlFor="password" className="form-label required-field">Password</label>
                                            <div className="password-input-wrapper">
                                                <input
                                                    type={showPassword ? "text" : "password"}
                                                    id="password"
                                                    name="password"
                                                    className="form-input"
                                                    value={password}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter your password"
                                                    required
                                                />
                                                <FontAwesomeIcon className="password-toggle-btn" onClick={togglePasswordVisibility} icon={showPassword ? faEyeSlash : faEye} />
                                            </div>
                                        </div>
                                        
                                        <div className="form-buttons">
                                            <button 
                                                type="submit" 
                                                className="form-submit-btn login-btn" 
                                                disabled={loading}
                                            >
                                                {loading ? 'Logging in...' : 'Login'}
                                            </button>
                                        </div>
                                    </form>
                                    <div className="login-help-text">
                                        <p>&copy; {new Date().getFullYear()} Neozep</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </main>
                </div>
            </div>
        </div>
    );
}