import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Register.css';

function Register({ onRegister }) {
  const { t } = useTranslation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    try {
      const response = await fetch('http://34.118.61.73/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.Message || t('register.error'));
        return;
      }
      localStorage.setItem('role', data.role);
      localStorage.setItem('token', data.Token);
      setSuccess(t('register.success'));
      if (onRegister) onRegister();
      setTimeout(() => navigate('/'), 1000);
    } catch (err) {
      setError(t('register.connectionError'));
    }
  };

  return (
    <div className="register-container">
      <form onSubmit={handleSubmit} className="register-form">
        <h2>{t('register.title')}</h2>
        <input
          type="text"
          placeholder={t('register.username')}
          value={username}
          onChange={e => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder={t('register.password')}
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
        <button type="submit">{t('register.button')}</button>
        {error && <div className="error">{error}</div>}
        {success && <div className="success">{success}</div>}
        <p>
          {t('register.alreadyHaveAccount')}{' '}
          <Link to="/login">{t('register.loginNow')}</Link>
        </p>
      </form>
    </div>
  );
}

export default Register;