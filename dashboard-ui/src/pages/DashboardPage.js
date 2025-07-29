import React, { useEffect, useState } from 'react';
import Sidebar from '../components/Sidebar';
import '../css/dashboard.css';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

// Use env var for API base (Vercel/Prod) and fallback to localhost for dev
const API_BASE_URL =
  process.env.REACT_APP_API_BASE || 'http://localhost:4000/api';

const DashboardPage = () => {
  const { user, token } = useAuth();
  const [fonts, setFonts] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: 'createdAt', direction: 'desc' });
  const [previewFont, setPreviewFont] = useState(null);
  const [previewText, setPreviewText] = useState('The quick brown fox jumps over the lazy dog');
  const [fontSize, setFontSize] = useState(48);
  const [color, setColor] = useState('#000000');
  const [bgColor, setBgColor] = useState('#ffffff');
  const [lineHeight, setLineHeight] = useState(1.4);
  const [fontLoaded, setFontLoaded] = useState(false);

  // Fetch fonts for the logged-in user
  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const res = await axios.get(`${API_BASE_URL}/fonts/user`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        setFonts(res.data);
      } catch (err) {
        console.error('❌ Error fetching fonts:', err);
      }
    };
    if (token) {
      fetchFonts();
    }
  }, [user, token]);

  // Load font preview dynamically
  useEffect(() => {
    if (!previewFont) return;

    setFontLoaded(false);
    console.log('🧐 Trying to load font from URL:', previewFont.url);

    const fontFace = new FontFace(previewFont.fullName, `url(${previewFont.url})`);
    fontFace
      .load()
      .then((loaded) => {
        document.fonts.add(loaded);
        setFontLoaded(true);
        console.log(`✅ Font ${previewFont.fullName} loaded`);
      })
      .catch((err) => {
        console.error(`❌ Failed to load font ${previewFont.fullName}:`, err);
      });
  }, [previewFont]);

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
      await axios.delete(`${API_BASE_URL}/fonts/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setFonts((prev) => prev.filter((font) => font._id !== id));
    } catch (err) {
      console.error('❌ Error deleting font:', err);
    }
  };

  const openPreview = (font) => {
    const fontUrl = `https://fontflowbucket.s3.eu-north-1.amazonaws.com/${font.originalFile}`;
    const fontName = font.family || font.fullName || font.name;

    console.log('📦 Font object received:', font);
    console.log('🌐 Using font URL:', fontUrl);

    setPreviewFont({
      ...font,
      url: fontUrl,
      fullName: fontName,
    });

    setPreviewText('The quick brown fox jumps over the lazy dog');
    setFontSize(48);
    setColor('#000000');
    setBgColor('#ffffff');
    setLineHeight(1.4);
  };

  const closePreview = () => {
    setPreviewFont(null);
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
                <th>Actions</th>
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
                    <button onClick={() => openPreview(font)}>Preview</button>{' '}
                    <button onClick={() => deleteFont(font._id)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {previewFont && (
          <div className="font-preview-overlay" onClick={closePreview}>
            <div className="font-preview-modal" onClick={(e) => e.stopPropagation()}>
              <div className="preview-controls">
                <label>
                  Text:
                  <input value={previewText} onChange={(e) => setPreviewText(e.target.value)} />
                </label>
                <label>
                  Size:
                  <input
                    type="number"
                    value={fontSize}
                    onChange={(e) => setFontSize(Number(e.target.value))}
                  />
                </label>
                <label>
                  Text Color:
                  <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
                </label>
                <label>
                  Background:
                  <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} />
                </label>
                <label>
                  Line Height:
                  <input
                    type="number"
                    step="0.1"
                    min="1"
                    value={lineHeight}
                    onChange={(e) => setLineHeight(Number(e.target.value))}
                  />
                </label>
                <button onClick={closePreview}>Close</button>
              </div>

              <div
                className="preview-area"
                style={{
                  fontFamily: `'${previewFont.fullName}'`,
                  fontSize: `${fontSize}px`,
                  color,
                  backgroundColor: bgColor,
                  lineHeight,
                  padding: '2rem',
                }}
              >
                {!fontLoaded ? 'Loading font...' : previewText}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DashboardPage;
