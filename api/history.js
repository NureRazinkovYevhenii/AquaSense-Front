const API_BASE = 'http://34.118.61.73/api';

export async function fetchAquariumMeasurements(aquariumId) {
  const response = await fetch(`${API_BASE}/aquarium/${aquariumId}/measurements`, {
    headers: {
      'Authorization': 'Bearer ' + localStorage.getItem('token')
    }
  });

  if (!response.ok) {
    throw new Error('Failed to fetch aquarium measurements');
  }

  return await response.json();
}