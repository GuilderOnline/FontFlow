// src/utils/api.js

let API_BASE = '';

if (window.location.hostname === 'localhost') {
  // ✅ Local backend
  API_BASE = 'http://localhost:4000/api';
} else {
  // ✅ Production backend
  API_BASE = 'https://fontflow-production-2412.up.railway.app/api';
}

export default API_BASE;
