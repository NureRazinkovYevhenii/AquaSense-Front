import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { fetchAquariumById, updateAquarium } from '../../api/aquarium';
import { fetchAllUsers } from '../../api/user';

function AquariumDetails() {
  const { t, i18n } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [aquarium, setAquarium] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedAquarium, setEditedAquarium] = useState({ name: '', description: '', userId: '' });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aquariumData, usersData] = await Promise.all([
          fetchAquariumById(id),
          fetchAllUsers()
        ]);
        setAquarium(aquariumData);
        setEditedAquarium({
          name: aquariumData.name,
          description: aquariumData.description || '',
          userId: String(aquariumData.userId)
        });
        setUsers(usersData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id]);

  const handleSave = async () => {
    try {
      const updated = await updateAquarium(id, {
        ...editedAquarium,
        userId: Number(editedAquarium.userId)
      });
      setAquarium(updated);
      setEditMode(false);
    } catch (err) {
      setError(err.message);
    }
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{t('admin.error')}: {error}</div>;
  if (!aquarium) return <div className="error">{t('admin.aquariumNotFound')}</div>;

  return (
    <div>
      <Header title={`${t('admin.aquarium')}: ${aquarium.name}`} />
      <div className="user-details">
        <div className="details-card">
          <div className="card-header">
            <h3>{t('admin.aquariumInfo')}</h3>
            <div className="card-actions">
              {editMode ? (
                <>
                  <button onClick={handleSave} className="btn-save">
                    <i className="fas fa-save"></i> {t('admin.save')}
                  </button>
                  <button onClick={() => setEditMode(false)} className="btn-cancel">
                    <i className="fas fa-times"></i> {t('admin.cancel')}
                  </button>
                </>
              ) : (
                <button onClick={() => setEditMode(true)} className="btn-edit">
                  <i className="fas fa-edit"></i> {t('admin.edit')}
                </button>
              )}
              <button onClick={() => navigate(`/admin/aquariums/${id}/history`)} className="btn-history">
                <i className="fas fa-history"></i> {t('admin.viewHistory')}
              </button>
              <button onClick={() => navigate('/admin/aquariums')} className="btn-back">
                <i className="fas fa-arrow-left"></i> {t('admin.back')}
              </button>
            </div>
          </div>
          <div className="user-info">
            <div className="info-row">
              <div className="info-label">ID:</div>
              <div className="info-value">{aquarium.id}</div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.name')}:</div>
              <div className="info-value">
                {editMode ? (
                  <input
                    type="text"
                    value={editedAquarium.name}
                    onChange={(e) => setEditedAquarium({...editedAquarium, name: e.target.value})}
                  />
                ) : (
                  aquarium.name
                )}
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.description')}:</div>
              <div className="info-value">
                {editMode ? (
                  <textarea
                    value={editedAquarium.description}
                    onChange={(e) => setEditedAquarium({...editedAquarium, description: e.target.value})}
                  />
                ) : (
                  aquarium.description || '-'
                )}
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.user')}:</div>
              <div className="info-value">
                {editMode ? (
                  <select
                    value={editedAquarium.userId}
                    onChange={(e) => setEditedAquarium({ ...editedAquarium, userId: e.target.value })}
                  >
                    {users.map(user => (
                      <option key={user.id} value={String(user.id)}>{user.username}</option>
                    ))}
                  </select>
                ) : (
                  users.find(u => u.id === Number(aquarium.userId))?.username || aquarium.userId
                )}
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.temperature')}:</div>
              <div className="info-value">{aquarium.temperature}°C</div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.light')}:</div>
              <div className="info-value">{aquarium.isLightOn ? t('enabled') : t('disabled')}</div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.lastFeeding')}:</div>
              <div className="info-value">
                {aquarium.lastFeedTime
                  ? new Date(aquarium.lastFeedTime + 'Z').toLocaleString(i18n.language === 'uk' ? 'uk-UA' : 'en-US')
                  : t('notAvailable')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AquariumDetails;
