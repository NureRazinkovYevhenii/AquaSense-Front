import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import './css/Users.css';
import { fetchAllUsers } from '../../api/user';
import {
  fetchAllAquariums,
  searchAquariumsByName,
  deleteAquarium,
  createAquarium
} from '../../api/aquarium';

import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

function Aquariums() {
  const { t } = useTranslation();
  const [aquariums, setAquariums] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAquarium, setNewAquarium] = useState({
    name: '',
    description: '',
    userId: ''
  });
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [aquariumsData, usersData] = await Promise.all([
          fetchAllAquariums(),
          fetchAllUsers()
        ]);
        setAquariums(aquariumsData);
        setUsers(usersData);
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleSearch = async () => {
    try {
      const data = searchTerm
        ? await searchAquariumsByName(searchTerm)
        : await fetchAllAquariums();
      setAquariums(data);
    } catch (err) {
      setError(err.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.deleteAquariumConfirm'))) {
      try {
        await deleteAquarium(id);
        setAquariums(prev => prev.filter(a => a.id !== id));
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleCreateAquarium = async (e) => {
    e.preventDefault();
    try {
      const created = await createAquarium(newAquarium);
      setAquariums(prev => [...prev, created]);
      setNewAquarium({ name: '', description: '', userId: '' });
      setShowCreateForm(false);
    } catch (err) {
      setError(err.message);
    }
  };

  const exportToExcel = () => {
    const dataToExport = aquariums.map(aq => ({
      ID: aq.id,
      Назва: aq.name,
      Опис: aq.description || '-',
      Користувач: users.find(u => u.id === aq.userId)?.username || aq.userId,
      Температура: aq.temperature != null ? aq.temperature : '-',
      Світло: aq.isLightOn != null ? (aq.isLightOn ? 'Увімкнено' : 'Вимкнено') : '-',
      Останнє_годування: aq.lastFeedTime ? new Date(aq.lastFeedTime).toLocaleString() : '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(dataToExport);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Акваріуми");

    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const blob = new Blob([wbout], { type: 'application/octet-stream' });
    saveAs(blob, 'aquariums.xlsx');
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{t('admin.error')}: {error}</div>;

  return (
    <div>
      <Header title={t('admin.aquariums')} />
      <div className="actions-bar">
        <div className="search-bar">
          <input
            type="text"
            placeholder={t('admin.searchByName')}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button onClick={handleSearch}>{t('admin.search')}</button>
        </div>
        <button 
          className="btn-create" 
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? t('admin.cancel') : t('admin.createAquarium')}
        </button>
        <button className="btn-export" onClick={exportToExcel} style={{ marginLeft: 10 }}>
          {t('admin.exportExcel') || 'Експорт в Excel'}
        </button>
      </div>
      {showCreateForm && (
        <div className="create-form">
          <h3>{t('admin.createNewAquarium')}</h3>
          <form onSubmit={handleCreateAquarium}>
            <div className="form-group">
              <label>{t('admin.name')}</label>
              <input
                type="text"
                value={newAquarium.name}
                onChange={(e) => setNewAquarium({...newAquarium, name: e.target.value})}
                required
              />
            </div>
            <div className="form-group">
              <label>{t('admin.description')}</label>
              <textarea
                value={newAquarium.description || ''}
                onChange={(e) => setNewAquarium({...newAquarium, description: e.target.value})}
              />
            </div>
            <div className="form-group">
              <label>{t('admin.user')}</label>
              <select
                value={newAquarium.userId}
                onChange={(e) => setNewAquarium({...newAquarium, userId: e.target.value})}
                required
              >
                <option value="">{t('admin.selectUser')}</option>
                {users.map(user => (
                  <option key={user.id} value={user.id}>{user.username}</option>
                ))}
              </select>
            </div>
            <button type="submit" className="btn-submit">{t('admin.create')}</button>
          </form>
        </div>
      )}
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th>{t('admin.name')}</th>
              <th>{t('admin.description')}</th>
              <th>{t('admin.user')}</th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {aquariums.map(aquarium => (
              <tr key={aquarium.id}>
                <td>{aquarium.id}</td>
                <td>{aquarium.name}</td>
                <td>{aquarium.description || '-'}</td>
                <td>
                  {users.find(u => u.id === aquarium.userId)?.username || aquarium.userId}
                </td>
                <td className="actions">
                  <Link to={`/admin/aquariums/${aquarium.id}`} className="btn-view">
                    <i className="fas fa-eye"></i>
                  </Link>
                  <button onClick={() => handleDelete(aquarium.id)} className="btn-delete">
                    <i className="fas fa-trash"></i>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Aquariums;