import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import { getUserById, updateUserById, getUserAquariums } from '../../api/user';

function UserDetails() {
  const { t } = useTranslation();
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [editedUser, setEditedUser] = useState({ username: '' });
  const [userAquariums, setUserAquariums] = useState([]);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const userData = await getUserById(id);
        setUser(userData);
        setEditedUser({ username: userData.username });

        const aquariumsData = await getUserAquariums(id);
        setUserAquariums(aquariumsData);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchUserData();
  }, [id]);

  const handleSave = async () => {
    try {
      const updatedUser = await updateUserById(id, { username: editedUser.username });
      setUser(updatedUser);
      setEditMode(false);
    } catch (error) {
      setError(error.message);
    }
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{t('admin.error')}: {error}</div>;
  if (!user) return <div className="error">{t('admin.userNotFound')}</div>;

  return (
    <div>
      <Header title={`${t('admin.user')}: ${user.username}`} />
      <div className="user-details">
        <div className="details-card">
          <div className="card-header">
            <h3>{t('admin.userInfo')}</h3>
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
              <button onClick={() => navigate('/admin/users')} className="btn-back">
                <i className="fas fa-arrow-left"></i> {t('admin.back')}
              </button>
            </div>
          </div>
          <div className="user-info">
            <div className="info-row">
              <div className="info-label">ID:</div>
              <div className="info-value">{user.id}</div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.username')}:</div>
              <div className="info-value">
                {editMode ? (
                  <input
                    type="text"
                    value={editedUser.username}
                    onChange={(e) =>
                      setEditedUser({ ...editedUser, username: e.target.value })
                    }
                  />
                ) : (
                  user.username
                )}
              </div>
            </div>
            <div className="info-row">
              <div className="info-label">{t('admin.role')}:</div>
              <div className="info-value">{user.role}</div>
            </div>
          </div>
        </div>
        <div className="details-card">
          <div className="card-header">
            <h3>{t('admin.userAquariums')}</h3>
          </div>
          {userAquariums.length > 0 ? (
            <table className="users-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>{t('admin.name')}</th>
                  <th>{t('admin.description')}</th>
                </tr>
              </thead>
              <tbody>
                {userAquariums.map((aquarium) => (
                  <tr key={aquarium.id}>
                    <td>{aquarium.id}</td>
                    <td>{aquarium.name}</td>
                    <td>{aquarium.description || '-'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="no-data">{t('admin.noAquariums')}</p>
          )}
        </div>
      </div>
    </div>
  );
}

export default UserDetails;
