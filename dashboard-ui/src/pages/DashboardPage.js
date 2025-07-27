import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../css/dashboard.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [fonts, setFonts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const res = await axios.get(`http://localhost:4000/api/fonts/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFonts(res.data);
      } catch (err) {
        console.error('❌ Error fetching fonts:', err);
      }
    };

    fetchFonts();
  }, [user, token]);

  const handleSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIndicator = (key) => {
    if (sortConfig.key === key) {
      return sortConfig.direction === 'asc' ? '↑' : '↓';
    }
    return '';
  };

  const sortedFonts = [...fonts].sort((a, b) => {
    const aVal = a[sortConfig.key];
    const bVal = b[sortConfig.key];

    if (sortConfig.key === 'createdAt') {
      return sortConfig.direction === 'asc'
        ? new Date(aVal) - new Date(bVal)
        : new Date(bVal) - new Date(aVal);
    }

    const aStr = aVal?.toString().toLowerCase() || '';
    const bStr = bVal?.toString().toLowerCase() || '';
    if (aStr < bStr) return sortConfig.direction === 'asc' ? -1 : 1;
    if (aStr > bStr) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const deleteFont = async (id) => {
    try {
      await axios.delete(`http://localhost:4000/api/fonts/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setFonts((prev) => prev.filter((font) => font._id !== id));
    } catch (err) {
      console.error('❌ Error deleting font:', err);
    }
  };

  return (
    <div className="dashboard-container">
      <Sidebar />
      <div className="dashboard-content">
        <h1>Welcome, {user?.role === 'admin' ? 'Admin' : 'User'}</h1>

        <div className="summary-cards">
          <div className="card">Total Fonts: {fonts.length}</div>
          <div className="card">Plan: Pro</div>
          <div className="card">Status: Active</div>
          <div className="card">Role: {user?.role}</div>
        </div>

        <div className="fonts-table">
          <h2>Recent Fonts</h2>
          <table>
            <thead>
              <tr>
                <th onClick={() => handleSort('fullName')}>Full Name {getSortIndicator('fullName')}</th>
                <th onClick={() => handleSort('style')}>Style {getSortIndicator('style')}</th>
                <th onClick={() => handleSort('weight')}>Weight {getSortIndicator('weight')}</th>
                <th onClick={() => handleSort('description')}>Description {getSortIndicator('description')}</th>
                <th onClick={() => handleSort('manufacturer')}>Manufacturer {getSortIndicator('manufacturer')}</th>
                <th onClick={() => handleSort('license')}>License {getSortIndicator('license')}</th>
                <th onClick={() => handleSort('createdAt')}>Created At {getSortIndicator('createdAt')}</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {sortedFonts.map((font) => (
                <tr key={font._id}>
                  <td>{font.fullName}</td>
                  <td>{font.style}</td>
                  <td>{font.weight}</td>
                  <td>{font.description}</td>
                  <td>{font.manufacturer}</td>
                  <td>{font.license}</td>
                  <td>{new Date(font.createdAt).toLocaleString()}</td>
                  <td>
                    <button onClick={() => deleteFont(font._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
