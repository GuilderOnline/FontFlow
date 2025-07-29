import React, { useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../css/dashboard.css';

const SettingsPage = () => {
  const [gdprEnabled, setGdprEnabled] = useState(true);

  const handleToggle = () => {
    setGdprEnabled(!gdprEnabled);
    // ✅ TODO: Optionally save setting via API call
  };

  const regenerateApiKey = () => {
    // ✅ TODO: Replace with API call to regenerate key
    alert('🔐 API key regenerated!');
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Font Flow</h1>

        <div className="settings-section">
          <h2>GDPR & Privacy</h2>
          <label className="gdpr-toggle">
            <input
              type="checkbox"
              checked={gdprEnabled}
              onChange={handleToggle}
            />
            Host fonts without sharing Ps
          </label>
          <p className="gdpr-description">
            This option disables IP address sharing to comply with GDPR standards.
          </p>
        </div>

        <div className="settings-section">
          <h2>API Key Management</h2>
          <button className="regenerate-btn" onClick={regenerateApiKey}>
            Regenerate API Key
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
