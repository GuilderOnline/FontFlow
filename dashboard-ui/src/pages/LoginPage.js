import React, { useState } from 'react';
import '../css/style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ✅ Use same-origin path so Vercel rewrite handles it
const API_BASE = '/api';

const LoginPage = () => {
  const { login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`${API_BASE}/auth/login`, {
        email,
        password,
      });

      const { token, user } = response.data;
      console.log('✅ Login success:', { token, user });

      login(token, user);

      setTimeout(() => {
        if (user.role === 'admin') {
          navigate('/dashboard');
        } else {
          navigate(`/dashboard?user=${user.id}`);
        }
      }, 100);
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    // ... your JSX remains unchanged
  );
};

export default LoginPage;
