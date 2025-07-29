import React, { useState } from 'react';
import '../css/style.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

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
      const response = await axios.post('http://localhost:4000/api/auth/login', {
        email,
        password,
      });

      const { token, user } = response.data;
      console.log('✅ Login success:', { token, user });

      login(token, user); // ⬅️ store token + user in context/localStorage

      // ✅ Delay to allow context state to update
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
    <div className="login-container">
      <header className="login-header">
        <div className="logo">🔵 Font Flow</div>
        <nav>
          <p>About</p>
          <p>Pricing</p>
          <button className="login-link">Login</button>
        </nav>
      </header>

      <main className="login-main">
        <section className="welcome">
          <h1>Welcome to <strong>Font Flow</strong></h1>
          <p>Self-host and manage your fonts with ease.</p>
          <button className="btn-primary">Get Started</button>
        </section>

        <section className="login-box">
          <h2>Login</h2>
          <form onSubmit={handleLogin}>
            <label>Email address</label>
            <input
              type="email"
              placeholder="Enter email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
            />

            <label>Password</label>
            <input
              type="password"
              placeholder="Enter password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="current-password"
            />

            <div className="forgot">
              <p>Forgot password?</p>
            </div>

            {error && <p className="error-message">{error}</p>}

            <button className="btn-primary" type="submit" disabled={loading}>
              {loading ? 'Logging in...' : 'Login'}
            </button>
          </form>
        </section>
      </main>

      <section className="about">
        <h2>About Font Flow</h2>
        <p>
          Font Flow provides a reliable, privacy-friendly platform for uploading, optimizing,
          and serving web fonts, tailored for developers and designers.
        </p>
      </section>

      <section className="pricing">
        <h2>Pricing</h2>
        <div className="plans">
          <div className="plan">
            <h3>Free</h3>
            <p>Basic font hosting features to get you started</p>
          </div>
          <div className="plan">
            <h3>Pro</h3>
            <p>Advanced features for professional use</p>
          </div>
        </div>
      </section>
    </div>
  );
};

export default LoginPage;
