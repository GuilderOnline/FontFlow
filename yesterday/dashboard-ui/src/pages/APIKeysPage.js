import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../css/dashboard.css';

const APIKeysPage = () => {
  const [apiKey] = useState('abcde12345'); // This would be fetched dynamically in production

  const copyToClipboard = () => {
    navigator.clipboard.writeText(apiKey);
    alert('API key copied to clipboard!');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Font Flow</h1>
        <p>Font CDN-as-a-Service</p>
        <h2>API Keys</h2>

        <div className="api-key-box">
          <label>Key 1</label>
          <div className="api-key-row">
            <input type="text" readOnly value={apiKey} />
            <button onClick={copyToClipboard}>Copy</button>
            <button className="delete-btn">🗑️</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default APIKeysPage;
