"use client";

import { useState, FormEvent } from "react";
import { useRouter } from "next/navigation";
import "../styles/layout.css";
import "../styles/form.css";

export default function FormPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    nama: "",
    namaToko: "",
    alamat: "",
    email: "",
    telepon: ""
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Video upload is no longer needed

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    
    try {
      // Convert form field names to match API expectations
      const submissionData = {
        nama: formData.nama,
        nama_toko: formData.namaToko,
        alamat: formData.alamat,
        email: formData.email,
        telepon: formData.telepon
      };
      
      const response = await fetch('/api/submissions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit form');
      }
      
      // Reset the form
      setFormData({
        nama: "",
        namaToko: "",
        alamat: "",
        email: "",
        telepon: ""
      });
      
      // Show success message and redirect
      alert("Form submitted successfully!");
      router.push('/'); // Redirect to homepage
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
      console.error('Error submitting form:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-container">
      <div className="content-wrapper">
        <main className="main-content">
          <h1 className="header-title">Submit Form</h1>
          
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
                <button 
                  type="button" 
                  className="form-cancel-btn" 
                  onClick={() => window.history.back()}
                  disabled={loading}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </main>
        
        <footer className="footer">
          <div className="footer-content">
            &copy; {new Date().getFullYear()} Neozep. All rights reserved.
          </div>
        </footer>
      </div>
    </div>
  );
}
