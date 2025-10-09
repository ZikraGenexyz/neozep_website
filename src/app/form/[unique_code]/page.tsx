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

interface Province {
  id: number;
  name: string;
}

interface City {
  id: number;
  provinceId: number;
  name: string;
}

interface District {
  id: number;
  cityId: number;
  name: string;
}

interface Village {
  id: number;
  districtId: number;
  name: string;
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
  const [kotaKabupatenOptions, setKotaKabupatenOptions] = useState<string[]>([]);
  const [kecamatanOptions, setKecamatanOptions] = useState<string[]>([]);
  const [kelurahanOptions, setKelurahanOptions] = useState<string[]>([]);
  const [provinces, setProvinces] = useState<Province[]>([]);
  const [cities, setCities] = useState<City[]>([]);
  const [districts, setDistricts] = useState<District[]>([]);
  const [villages, setVillages] = useState<Village[]>([]);
  
  const [formData, setFormData] = useState({
    nama: "",
    namaToko: "",
    jalan: "",
    provinsi: "",
    kota_kabupaten: "",
    kecamatan: "",
    kelurahan: "",
    email: "",
    telepon: ""
  });

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        // Load provinces
        const provincesRes = await fetch('/data/provinces.json');
        const provincesData = await provincesRes.json();
        setProvinces(provincesData as Province[]);
        
        // Load cities
        const citiesRes = await fetch('/data/cities.json');
        const citiesData = await citiesRes.json();
        setCities(citiesData as City[]);
        
        // Load districts
        const districtsRes = await fetch('/data/districts.json');
        const districtsData = await districtsRes.json();
        setDistricts(districtsData as District[]);
        
        // Load villages
        const villagesRes = await fetch('/data/villages.json');
        const villagesData = await villagesRes.json();
        setVillages(villagesData as Village[]);
      } catch (error) {
        console.error('Error loading data:', error);
      }
    };
    
    loadData();
  }, []);

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

  // Handle province change
  const handleProvinceChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const provinceId = provinces.find(province => province.name === e.target.value)?.id;
    setFormData(prev => ({
      ...prev,
      provinsi: e.target.value,
      kota_kabupaten: "",
      kecamatan: "",
      kelurahan: ""
    }));

    // Filter cities by province
    const filteredCities = cities.filter(city => city.provinceId === provinceId);

    setKotaKabupatenOptions(filteredCities.map(city => city.name));
    setKecamatanOptions([]);
    setKelurahanOptions([]);
  };

  // Handle city change
  const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const cityId = cities.find(city => city.name === e.target.value)?.id;
    setFormData(prev => ({
      ...prev,
      kota_kabupaten: e.target.value,
      kecamatan: "",
      kelurahan: ""
    }));
    
    // Filter districts by city
    const filteredDistricts = districts.filter(district => district.cityId === cityId);
    setKecamatanOptions(filteredDistricts.map(district => district.name));
    setKelurahanOptions([]);
  };  

  // Handle district change
  const handleDistrictChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const districtId = districts.find(district => district.name === e.target.value)?.id;
    setFormData(prev => ({
      ...prev,
      kecamatan: e.target.value,
      kelurahan: ""
    }));
    
    // Filter villages by district
    const filteredVillages = villages.filter(village => village.districtId === districtId);
    setKelurahanOptions(filteredVillages.map(village => village.name));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  // Add this to your component
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Set custom validation message
    const emailInput = e.target;
    emailInput.setCustomValidity('');
    
    if (emailInput.validity.typeMismatch) {
      emailInput.setCustomValidity('Please enter a valid email address');
    }
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
        alamat: formData.jalan + "\n\nKelurahan " + formData.kelurahan + ", Kecamatan " + formData.kecamatan + ", " + formData.kota_kabupaten + ", " + formData.provinsi,
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
        body: JSON.stringify({...submissionData}),
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
        jalan: "",
        provinsi: "",
        kota_kabupaten: "",
        kecamatan: "",
        kelurahan: "",
        email: "",
        telepon: ""
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
                        <label htmlFor="jalan" className="form-label required-field">Nama Jalan</label>
                        <input
                          type="text"
                          id="jalan"
                          name="jalan"
                          className="form-input"
                          value={formData.jalan}
                          onChange={handleInputChange}
                          required
                        />
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="provinsi" className="form-label required-field">Provinsi</label>
                          <select
                            id="provinsi"
                            name="provinsi"
                            className="form-input"
                            value={formData.provinsi}
                            onChange={handleProvinceChange}
                            required
                          >
                            {formData.provinsi === "" && (
                              <option value="" disabled>Pilih Provinsi</option>
                            )}
                            {provinces.map(province => (
                              <option key={province.name} value={province.name} disabled={formData.provinsi === province.name}>
                                {province.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="kota_kabupaten" className="form-label required-field">Kota / Kabupaten</label>
                          <select
                            id="kota_kabupaten"
                            name="kota_kabupaten"
                            className="form-input"
                            value={formData.kota_kabupaten}
                            onChange={handleCityChange}
                            disabled={formData.provinsi === ""}
                            required
                          >
                            {formData.kota_kabupaten === "" && (
                              <option value="" disabled>Pilih Kota / Kabupaten</option>
                            )}
                            {kotaKabupatenOptions.map(kotaKabupaten => (
                              <option key={kotaKabupaten} value={kotaKabupaten} disabled={formData.kota_kabupaten === kotaKabupaten}>
                                {kotaKabupaten}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="form-row">
                        <div className="form-group">
                          <label htmlFor="kecamatan" className="form-label required-field">Kecamatan</label>
                          <select
                            id="kecamatan"
                            name="kecamatan"
                            className="form-input"
                            value={formData.kecamatan}
                            onChange={handleDistrictChange}
                            disabled={formData.kota_kabupaten === ""}
                            required
                          >
                            {formData.kecamatan === "" && (
                              <option value="" disabled>Pilih Kecamatan</option>
                            )}
                            {kecamatanOptions.map(kecamatan => (
                              <option key={kecamatan} value={kecamatan} disabled={formData.kecamatan === kecamatan}>
                                {kecamatan}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label htmlFor="kelurahan" className="form-label required-field">Kelurahan</label>
                          <select
                            id="kelurahan"
                            name="kelurahan"
                            className="form-input"
                            value={formData.kelurahan}
                            onChange={handleInputChange}
                            disabled={formData.kecamatan === ""}
                            required
                          >
                            {formData.kelurahan === "" && (
                              <option value="" disabled>Pilih Kelurahan</option>
                            )}
                            {kelurahanOptions.map(kelurahan => (
                              <option key={kelurahan} value={kelurahan} disabled={formData.kelurahan === kelurahan}>
                                {kelurahan}
                              </option>
                            ))}
                          </select>
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
                            onChange={handleEmailChange}
                            pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
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