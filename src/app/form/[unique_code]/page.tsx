// Create: src/app/form/[unique_code]/page.tsx
"use client";

import { useState, FormEvent, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import "../../styles/layout.css";
import "../../styles/form.css";

interface UniqueCodeData {
  id: number;
  code: string;
  is_used: boolean;
  created_at: string;
  used_at?: string;
  submission_id?: number;
}

export default function FormWithUniqueCodePage() {
  const router = useRouter();
  const params = useParams();
  const uniqueCode = params.unique_code as string;
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [codeData, setCodeData] = useState<UniqueCodeData | null>(null);
  const [codeLoading, setCodeLoading] = useState(true);
  const [codeError, setCodeError] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    nama: "",
    namaToko: "",
    alamat: "",
    email: "",
    telepon: "",
    kecamatan: "",
    kelurahan: ""
  });

  // Validate unique code on component mount
  useEffect(() => {
    const validateCode = async () => {
      try {
        setCodeLoading(true);
        const response = await fetch(`/api/unique-code/validate/${uniqueCode}`);
        
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Invalid access code');
        }
        
        const data = await response.json();
        setCodeData(data);
        
        if (data.is_used) {
          setCodeError('This access code has already been used');
        }
      } catch (err) {
        setCodeError(err instanceof Error ? err.message : 'Failed to validate access code');
      } finally {
        setCodeLoading(false);
      }
    };

    if (uniqueCode) {
      validateCode();
    }
  }, [uniqueCode]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const response = await fetch(`/api/unique-code/validate/${uniqueCode}`);

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Invalid access code');
    }

    const data = await response.json();
    setCodeData(data);

    if (data.is_used) {
      setCodeError('This access code has already been used');
      setLoading(false);
      return;
    }

    try {
      // Convert form field names to match API expectations
      const submissionData = {
        nama: formData.nama,
        nama_toko: formData.namaToko,
        alamat: formData.alamat,
        email: formData.email,
        telepon: formData.telepon,
        kecamatan: formData.kecamatan,
        kelurahan: formData.kelurahan,
        unique_code: uniqueCode
      };
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({...submissionData, alamat: formData.alamat + ", Kecamatan " + formData.kecamatan + ", Kelurahan " + formData.kelurahan}),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }

      const response2 = await fetch('/api/unique-code', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: uniqueCode, submission_id: (await response.json()).submission.id }),
      });

      if (!response2.ok) {
        const errorData = await response2.json();
        throw new Error(errorData.error || 'Failed to mark unique code as used');
      }

      // Reset the form
      setFormData({
        nama: "",
        namaToko: "",
        alamat: "",
        email: "",
        telepon: "",
        kecamatan: "",
        kelurahan: ""
      });
      
      // Show success message
      setSubmitted(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  // Show loading state while validating code
  if (codeLoading) {
    return (
      <div className="form-page">
        <div className="main-container">
          <div className="content-wrapper" style={{ maxWidth: '100vw !important' }}>
            <main className="main-content">
              <div className="form-page-layout">
                <div className="form-logo-section">
                  <div className="form-logo-wrapper">
                    <img src="/neozep_logo.png" alt="Neozep Logo" className="form-logo" />
                    <span className="form-logo-text">SUBMISSION FORM</span>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-container">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: 'var(--text)' }}>Validating access code...</div>
                      <div style={{ color: '#666' }}>Please wait while we verify your access code.</div>
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

  // Show error if code is invalid or already used
  if (codeError || !codeData) {
    return (
      <div className="form-page">
        <div className="main-container">
          <div className="content-wrapper" style={{ maxWidth: '100vw !important' }}>
            <main className="main-content">
              <div className="form-page-layout">
                <div className="form-logo-section">
                  <div className="form-logo-wrapper">
                    <img src="/neozep_logo.png" alt="Neozep Logo" className="form-logo" />
                    <span className="form-logo-text">SUBMISSION FORM</span>
                  </div>
                </div>
                <div className="form-section">
                  <div className="form-container">
                    <div style={{ textAlign: 'center', padding: '2rem' }}>
                      <div style={{ fontSize: '1.2rem', marginBottom: '1rem', color: '#e74c3c' }}>
                        ❌ Access Denied
                      </div>
                      <div style={{ color: '#666' }}>
                        {codeError || 'Invalid access code'}
                      </div>
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

  return (
    <div className="form-page">
      <div className="main-container">
        <div className="content-wrapper" style={{ maxWidth: '100vw !important' }}>
          <main className="main-content">
            <div className="form-page-layout">
              <div className="form-logo-section">
                <div className="form-logo-wrapper">
                  <img src="/neozep_logo.png" alt="Neozep Logo" className="form-logo" />
                  <span className="form-logo-text">SUBMISSION FORM</span>
                </div>
              </div>
              <div className="form-section">
                {submitted ? (
                  <div className="form-success-container">
                    <div className="form-success-check">
                      <svg viewBox="0 0 60 60" className="form-success-checkmark">
                        <circle className="form-success-circle" cx="30" cy="30" r="25" fill="none" />
                        <path className="form-success-check-path" fill="none" d="M18.1 31.2l7.1 7.2 16.7-16.8" />
                      </svg>
                    </div>
                    <h2 className="form-success-title">Thank You!</h2>
                    <p className="form-success-message">Your submission has been received successfully. Result will be sent to your email in 2x24 hours.</p>
                  </div>
                ) : (
                  <div className="form-container">
                    <form onSubmit={handleSubmit}>
                      <div className="form-group">
                        <label htmlFor="nama" className="form-label required-field">Nama</label>
                        <input
                          type="text"
                          id="nama"
                          name="nama"
                          className="form-input"
                          value={formData.nama}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-group">
                        <label htmlFor="namaToko" className="form-label required-field">Nama Toko</label>
                        <input
                          type="text"
                          id="namaToko"
                          name="namaToko"
                          className="form-input"
                          value={formData.namaToko}
                          onChange={handleInputChange}
                          required
                        />
                      </div>
                      
                      <div className="form-group">
                        <label htmlFor="alamat" className="form-label required-field">Alamat</label>
                        <textarea
                          id="alamat"
                          name="alamat"
                          className="form-input form-textarea"
                          value={formData.alamat}
                          onChange={handleInputChange}
                          required
                        ></textarea>
                      </div>

                      <div className="form-row">  
                        <div className="form-group">
                          <label htmlFor="kecamatan" className="form-label required-field">Kecamatan</label>
                          <input
                            type="text"
                            id="kecamatan"
                            name="kecamatan"
                            className="form-input"
                            value={formData.kecamatan}
                            onChange={handleInputChange}
                            required
                          />
                        </div>

                        <div className="form-group">
                          <label htmlFor="kelurahan" className="form-label required-field">Kelurahan</label>
                          <input
                            type="text"
                            id="kelurahan"
                            name="kelurahan"
                            className="form-input"
                            value={formData.kelurahan}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="email" className="form-label required-field">Email</label>
                          <input
                            type="email"
                            id="email"
                            name="email"
                            className="form-input"
                            value={formData.email}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        
                        <div className="form-group">
                          <label htmlFor="telepon" className="form-label required-field">Telepon</label>
                          <input
                            type="tel"
                            id="telepon"
                            name="telepon"
                            className="form-input"
                            value={formData.telepon}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                      </div>
                      
                      {error && (
                        <div className="form-error">
                          {error}
                        </div>
                      )}
                      
                      <div className="form-buttons">
                        <button 
                          type="submit" 
                          className="form-submit-btn" 
                          disabled={loading}
                        >
                          {loading ? 'Submitting...' : 'Submit'}
                        </button>
                      </div>
                    </form>
                  </div>
                )}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}