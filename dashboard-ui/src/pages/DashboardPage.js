// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { getFonts } from '../api/api'; // Ensure this file exists

const Dashboard = () => {
  const [fonts, setFonts] = useState([]);

  useEffect(() => {
    const fetchFonts = async () => {
      try {
        const data = await getFonts(); // Can pass token if needed
        setFonts(data);
      } catch (err) {
        console.error('Error fetching fonts:', err);
      }
    };

    fetchFonts();
  }, []);

  return (
    <div>
      <h2>Font Dashboard</h2>
      {fonts.length > 0 ? (
        <ul>
          {fonts.map((font) => (
            <li key={font._id}>
              <strong>{font.name}</strong> – {font.family || 'Unknown'}
            </li>
          ))}
        </ul>
      ) : (
        <p>No fonts uploaded yet.</p>
      )}
    </div>
  );
};

export default Dashboard;
