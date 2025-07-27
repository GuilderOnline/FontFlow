import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

const Navbar = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();            // Clear context and localStorage
    navigate('/login');  // Redirect to login page
  };

  return (
    <nav className="navbar">
      <h1>FontFlow</h1>
      <ul>
        <li>Dashboard</li>
        <li>Upload</li>
        <li>Fonts</li>
        <li>Settings</li>
        <li>
          <button className="btn-logout" onClick={handleLogout}>
            Logout
          </button>
        </li>
      </ul>
    </nav>
  );
};

export default Navbar;

