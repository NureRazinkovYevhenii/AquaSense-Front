import React, { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Sidebar from '../../components/Sidebar';
import Header from '../../components/Header';
import Users from './Users';
import Aquariums from './Aquariums';
import UserDetails from './UserDetails';
import AquariumDetails from './AquariumDetails';
import AdminAquariumHistory from './AdminAquariumHistory';
import { fetchAdminStats } from '../../api/stats';
import './css/Dashboard.css';

function Dashboard() {
  const { t } = useTranslation();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalAquariums: 0
  });

  useEffect(() => {
    const fetchStatsData = async () => {
      try {
        const data = await fetchAdminStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching stats:', error);
      }
    };

    fetchStatsData();
  }, []);

  return (
    <div className="admin-layout">
      <Sidebar />
      <div className="admin-content">
        <Routes>
          <Route path="/" element={
            <>
              <Header title={t('admin.dashboard')} />
              <div className="dashboard-stats">
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-users"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{t('admin.users')}</h3>
                    <p className="stat-value">{stats.totalUsers}</p>
                  </div>
                </div>
                <div className="stat-card">
                  <div className="stat-icon">
                    <i className="fas fa-water"></i>
                  </div>
                  <div className="stat-details">
                    <h3>{t('admin.aquariums')}</h3>
                    <p className="stat-value">{stats.totalAquariums}</p>
                  </div>
                </div>
              </div>
            </>
          } />
          <Route path="/users" element={<Users />} />
          <Route path="/users/:id" element={<UserDetails />} />
          <Route path="/aquariums" element={<Aquariums />} />
          <Route path="/aquariums/:id" element={<AquariumDetails />} />
          <Route path="/aquariums/:id/history" element={<AdminAquariumHistory />} />
        </Routes>
      </div>
    </div>
  );
}

export default Dashboard;
