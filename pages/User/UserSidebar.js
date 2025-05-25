import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/UserSidebar.css';

function UserSidebar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem('lang', e.target.value);
  };

  return (
    <div className="user-sidebar">
      <h3>AquaSense</h3>
      <ul>
        <li className={location.pathname === '/user' ? 'active' : ''}>
          <Link to="/user">{t('aquariums')}</Link>
        </li>
        <li className={location.pathname === '/user/create' ? 'active' : ''}>
          <Link to="/user/create">{t('createAquarium')}</Link>
        </li>
        <li>
          <button
            onClick={() => {
              localStorage.removeItem('token');
              localStorage.removeItem('role');
              window.location.href = '/login';
            }}
          >
            {t('logout')}
          </button>
        </li>
        <li>
          <select value={i18n.language} onChange={handleLangChange} style={{ marginTop: 10 }}>
            <option value="uk">UA</option>
            <option value="en">EN</option>
          </select>
        </li>
      </ul>
    </div>
  );
}

export default UserSidebar;