const API_BASE = 'http://34.118.61.73/api';

export async function fetchAdminStats() {
  const response = await fetch(`${API_BASE}/admin/stats`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch admin stats');
  }

  return await response.json();
}
