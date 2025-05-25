// src/api/aquarium.js

const API_BASE = 'http://34.118.61.73/api';

export async function fetchAquariumById(id) {
  const response = await fetch(`${API_BASE}/admin/aquariums/${id}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch aquarium');
  }

  return await response.json();
}

export async function updateAquarium(id, payload) {
  const response = await fetch(`${API_BASE}/admin/aquariums/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error('Failed to update aquarium');
  }

  return await response.json();
}

export async function fetchAllAquariums() {
  const response = await fetch(`${API_BASE}/admin/aquariums`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) throw new Error('Failed to fetch aquariums');
  return await response.json();
}

export async function searchAquariumsByName(name) {
  const response = await fetch(`${API_BASE}/admin/aquariums/search?name=${name}`, {
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) throw new Error('Failed to search aquariums');
  return await response.json();
}

export async function deleteAquarium(id) {
  const response = await fetch(`${API_BASE}/admin/aquariums/${id}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    }
  });

  if (!response.ok) throw new Error('Failed to delete aquarium');
}

export async function createAquarium(data) {
  const response = await fetch(`${API_BASE}/admin/aquariums`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${localStorage.getItem('token')}`
    },
    body: JSON.stringify(data)
  });

  if (!response.ok) throw new Error('Failed to create aquarium');
  return await response.json();
}