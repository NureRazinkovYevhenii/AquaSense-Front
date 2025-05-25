import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './login.css';

function Login({ onLogin }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await fetch('http://34.118.61.73/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.Message || t('login.invalidCredentials'));
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      if (onLogin) onLogin();
      navigate('/');
    } catch (err) {
      setError(t('login.connectionError'));
    }
  };

  return (
    <div className="login-container">
      <form onSubmit={handleSubmit} className="login-form">
        <h2>{t('login.title')}</h2>
        <input
          type="text"
          placeholder={t('login.username')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('login.password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t('login.button')}</button>
        {error && <div className="error">{error}</div>}
        <p>
          {t('login.noAccount')}{' '}
          <Link to="/register">{t('login.registerNow')}</Link>
        </p>
      </form>
    </div>
  );
}

export default Login;