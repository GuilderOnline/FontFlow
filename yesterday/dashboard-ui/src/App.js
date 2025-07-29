// src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';
import { useAuth } from './context/AuthContext';
import ProjectsPage from './pages/ProjectsPage';
import APIKeysPage from './pages/APIKeysPage';
import SettingsPage from './pages/SettingsPage';


function App() {
  const { token } = useAuth();

  return (
    <Router>
      {token ? (
        <Routes>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/projects/:projectId" element={<ProjectsPage />} />
          <Route path="/projects" element={<ProjectsPage />} />
          <Route path="/apikeys" element={<APIKeysPage />} />
          <Route path="/settings" element={<SettingsPage />} />

          <Route path="*" element={<Navigate to="/dashboard" />} />
        </Routes>
      ) : (
        <Routes>
          <Route path="/" element={<LoginPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="*" element={<Navigate to="/login" />} />
        </Routes>
      )}
    </Router>
  );
}

export default App;
