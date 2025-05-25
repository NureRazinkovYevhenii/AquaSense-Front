// src/api/user.js

const API_BASE = 'http://34.118.61.73/api';

export async function fetchAllUsers() {
  const response = await fetch(`${API_BASE}/admin/users`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch users');
  }

  return await response.json();
}

export async function getUserById(id) {
  const response = await fetch(`${API_BASE}/admin/users/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user');
  return await response.json();
}

export async function updateUserById(id, data) {
  const response = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });
  if (!response.ok) throw new Error('Failed to update user');
  return await response.json();
}

export async function getUserAquariums(id) {
  const response = await fetch(`${API_BASE}/admin/aquariums/by-user/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch user aquariums');
  return await response.json();
}

export async function getAllUsers() {
  const response = await fetch(`${API_BASE}/admin/users`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Failed to fetch users');
  return await response.json();
}

export async function searchUsersByUsername(username) {
  const response = await fetch(`${API_BASE}/admin/users/search?username=${encodeURIComponent(username)}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Search failed');
  return await response.json();
}

export async function deleteUserById(id) {
  const response = await fetch(`${API_BASE}/admin/users/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });
  if (!response.ok) throw new Error('Delete failed');
}
