import React, { useState } from 'react';
import axios from 'axios';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';
import '../css/style.css';

// Use API base from .env or fallback to localhost for dev
const API_BASE_URL =
  process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

const UploadPage = () => {
  const { token } = useAuth();
  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [uploading, setUploading] = useState(false);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
    setMessage('');
  };

  const handleUpload = async (e) => {
    e.preventDefault();

    if (!file) {
      setMessage('Please select a font file to upload.');
      return;
    }

    const formData = new FormData();
    formData.append('font', file);

    try {
      setUploading(true);
      console.log('🔑 Token being sent:', token);

      const res = await axios.post(`${API_BASE_URL}/fonts/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage(`✅ Upload successful: ${res.data.filename}`);
      setFile(null);
    } catch (err) {
      setMessage(`❌ Upload failed: ${err.response?.data?.message || err.message}`);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="main-layout">
      <Sidebar />
      <div className="main-content">
        <h2>Upload a Font</h2>
        <form onSubmit={handleUpload} className="upload-form">
          <input
            type="file"
            accept=".ttf,.otf,.woff,.woff2"
            onChange={handleFileChange}
          />
          <button type="submit" disabled={uploading}>
            {uploading ? 'Uploading...' : 'Upload Font'}
          </button>
        </form>
        {message && <p className="upload-message">{message}</p>}
      </div>
    </div>
  );
};

export default UploadPage;
