import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './Sidebar.css';

function Sidebar() {
  const location = useLocation();
  const { t, i18n } = useTranslation();

  const handleLangChange = (e) => {
    i18n.changeLanguage(e.target.value);
    localStorage.setItem('lang', e.target.value);
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        <h3>AquaSense</h3>
        <p>{t('admin.panel')}</p>
      </div>
      <ul className="sidebar-menu">
        <li className={location.pathname === '/admin' ? 'active' : ''}>
          <Link to="/admin">
            <i className="fas fa-tachometer-alt"></i> {t('admin.dashboard')}
          </Link>
        </li>
        <li className={location.pathname.includes('/admin/users') ? 'active' : ''}>
          <Link to="/admin/users">
            <i className="fas fa-users"></i> {t('admin.users')}
          </Link>
        </li>
        <li className={location.pathname.includes('/admin/aquariums') ? 'active' : ''}>
          <Link to="/admin/aquariums">
            <i className="fas fa-water"></i> {t('admin.aquariums')}
          </Link>
        </li>
      </ul>
      <div className="sidebar-footer">
        <button onClick={() => {
          localStorage.removeItem('token');
          window.location.href = '/login';
        }}>
          <i className="fas fa-sign-out-alt"></i> {t('logout')}
        </button>
        <div className="sidebar-lang-switcher" style={{ marginTop: 12 }}>
          <select value={i18n.language} onChange={handleLangChange}>
            <option value="uk">UA</option>
            <option value="en">EN</option>
          </select>
        </div>
      </div>
    </div>
  );
}

export default Sidebar;