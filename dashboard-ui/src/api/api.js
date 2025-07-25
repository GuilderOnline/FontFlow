// src/api/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:4000/api';

export const getFonts = async (token) => {
  const res = await axios.get(`${API_BASE_URL}/fonts`, {
    headers: {
      Authorization: `Bearer ${token}`, // Optional: add API key or JWT if needed
      'x-api-key': 'fontflow-API-123',
    },
  });
  return res.data;
};
