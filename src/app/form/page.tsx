"use client";

import { useState, FormEvent } from "react";
import Navbar from "../../components/navbar";
import "../styles/layout.css";
import "../styles/form.css";

export default function FormPage() {
  const [formData, setFormData] = useState({
    nama: "",
    namaToko: "",
    alamat: "",
    email: "",
    telepon: "",
    video: null as File | null
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFormData({
        ...formData,
        video: e.target.files[0]
      });
    }
  };

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    
    // Here you would typically send the data to your backend
    console.log("Form submitted:", formData);
    
    // For demo purposes, show an alert
    alert("Form submitted successfully!");
    
    // Reset the form
    setFormData({
      nama: "",
      namaToko: "",
      alamat: "",
      email: "",
      telepon: "",
      video: null
    });
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
              
              <div className="form-buttons">
                <button type="submit" className="form-submit-btn">Submit</button>
                <button type="button" className="form-cancel-btn" onClick={() => window.history.back()}>Cancel</button>
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
