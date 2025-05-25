import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './css/History.css';
import { fetchAquariumMeasurements } from '../../api/history';

function AdminAquariumHistory() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadHistory = async () => {
      try {
        const data = await fetchAquariumMeasurements(id);
        setHistory(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };
    loadHistory();
  }, [id]);

  if (loading) return <div className="loading">{t('loading')}</div>;

  return (
    <div className="admin-layout">
      <div className="admin-content">
        <h2>{t('admin.aquariumMeasurementHistory')}</h2>
        <Link to={`/admin/aquariums/${id}`}>{t('admin.back')}</Link>
        <table className="history-table">
          <thead>
            <tr>
              <th>{t('date')}</th>
              <th>{t('temperature')}</th>
              <th>{t('light')}</th>
              <th>{t('lastFeeding')}</th>
            </tr>
          </thead>
          <tbody>
            {history.map((h, idx) => (
              <tr key={idx}>
                <td>{new Date(h.timestamp + 'Z').toLocaleString(i18n.language === 'uk' ? 'uk-UA' : 'en-US')}</td>
                <td>{h.temperature}°C</td>
                <td>{h.lightStatus ? t('enabled') : t('disabled')}</td>
                <td>
                  {h.lastFeedTime
                    ? new Date(h.lastFeedTime + 'Z').toLocaleString(i18n.language === 'uk' ? 'uk-UA' : 'en-US')
                    : t('notAvailable')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default AdminAquariumHistory;
