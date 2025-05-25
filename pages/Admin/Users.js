import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import Header from '../../components/Header';
import './css/Users.css';
import { getAllUsers, searchUsersByUsername, deleteUserById } from '../../api/user';

function Users() {
  const { t } = useTranslation();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState({ key: 'username', direction: 'asc' });

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const data = await getAllUsers();
        setUsers(data);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchUsers();
  }, []);

  const handleSearch = async () => {
    try {
      const data = searchTerm
        ? await searchUsersByUsername(searchTerm)
        : await getAllUsers();
      setUsers(data);
    } catch (error) {
      setError(error.message);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm(t('admin.deleteUserConfirm'))) {
      try {
        await deleteUserById(id);
        setUsers(users.filter(user => user.id !== id));
      } catch (error) {
        setError(error.message);
      }
    }
  };

  // Сортування користувачів за username
  const sortedUsers = React.useMemo(() => {
    let sortableUsers = [...users];
    if (sortConfig !== null) {
      sortableUsers.sort((a, b) => {
        const aName = a.username ? a.username.toLowerCase() : '';
        const bName = b.username ? b.username.toLowerCase() : '';
        if (aName < bName) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aName > bName) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableUsers;
  }, [users, sortConfig]);

  // Обробник кліку по заголовку username
  const requestSort = () => {
    let direction = 'asc';
    if (sortConfig.key === 'username' && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key: 'username', direction });
  };

  // Відображення стрілок сортування
  const getSortArrow = () => {
    if (sortConfig.key !== 'username') return null;
    return sortConfig.direction === 'asc' ? '▲' : '▼';
  };

  if (loading) return <div className="loading">{t('loading')}</div>;
  if (error) return <div className="error">{t('admin.error')}: {error}</div>;

  return (
    <div>
      <Header title={t('admin.users')} />
      <div className="search-bar">
        <input
          type="text"
          placeholder={t('admin.searchPlaceholder')}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <button onClick={handleSearch}>{t('admin.search')}</button>
      </div>
      <div className="users-table-container">
        <table className="users-table">
          <thead>
            <tr>
              <th>ID</th>
              <th
                onClick={requestSort}
                style={{ cursor: 'pointer', userSelect: 'none' }}
                title={t('admin.sortByUsername')}
              >
                {t('admin.username')} {getSortArrow()}
              </th>
              <th>{t('admin.role')}</th>
              <th>{t('admin.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {sortedUsers.map(user => (
              <tr key={user.id}>
                <td>{user.id}</td>
                <td>{user.username}</td>
                <td>{user.role}</td>
                <td className="actions">
                  <Link to={`/admin/users/${user.id}`} className="btn-view">
                    <i className="fas fa-eye"></i>
                  </Link>
                  <button onClick={() => handleDelete(user.id)} className="btn-delete">
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

export default Users;