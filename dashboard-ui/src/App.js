import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import UploadPage from './pages/UploadPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

function App() {
  return (
    <Router>
      <Navbar />
      <div className="main-layout">
        <Sidebar />
        <div className="main-content">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/upload" element={<UploadPage />} />
            <Route path="/login" element={<LoginPage />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
}

export default App;
