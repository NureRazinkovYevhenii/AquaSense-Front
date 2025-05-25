const API_BASE = "http://34.118.61.73/api";

export async function fetchAquariumHistory(aquariumId, token) {
  const res = await fetch(`${API_BASE}/aquarium/${aquariumId}/measurements`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (!res.ok) {
    throw new Error("Помилка завантаження історії");
  }
  return await res.json();
}

export async function fetchAquariums(token) {
  const res = await fetch(`${API_BASE}/Aquarium`, {
    headers: {
      Authorization: "Bearer " + token,
    },
  });
  if (!res.ok) {
    throw new Error("Помилка завантаження акваріумів");
  }
  return await res.json();
}

export async function createAquarium(data, token) {
  const res = await fetch(`${API_BASE}/aquarium/create`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    throw new Error("Помилка створення акваріума");
  }
  return await res.json();
}

export async function fetchAquariumById(id, token) {
  const res = await fetch(`${API_BASE}/aquarium/get/${id}`, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) {
    const error = new Error("Помилка завантаження акваріума");
    error.status = res.status;
    throw error;
  }
  return await res.json();
}

export async function fetchSchedule(id, token) {
  const res = await fetch(`${API_BASE}/aquarium/${id}/schedule`, {
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) {
    const error = new Error("Помилка завантаження розкладу");
    error.status = res.status;
    throw error;
  }
  return await res.json();
}

export async function deleteAquarium(id, token) {
  const res = await fetch(`${API_BASE}/aquarium/delete/${id}`, {
    method: "DELETE",
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) {
    const error = new Error("Помилка видалення акваріума");
    error.status = res.status;
    throw error;
  }
  return await res.text();
}

export async function toggleLight(id, token) {
  const res = await fetch(`${API_BASE}/iot/turnLight/${id}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) {
    const error = new Error("Помилка увімкнення/вимкнення світла");
    error.status = res.status;
    throw error;
  }
  return await res.text();
}

export async function feedFish(id, token) {
  const res = await fetch(`${API_BASE}/iot/feed/${id}`, {
    method: "POST",
    headers: { Authorization: "Bearer " + token },
  });
  if (!res.ok) {
    const error = new Error("Помилка годування риб");
    error.status = res.status;
    throw error;
  }
  return await res.text();
}

export async function saveSchedule(id, token, payload) {
  const res = await fetch(`${API_BASE}/aquarium/${id}/schedule`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: "Bearer " + token,
    },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const error = new Error("Помилка збереження розкладу");
    error.status = res.status;
    try {
      const data = await res.json();
      error.message = data.title || error.message;
    } catch {
      // ignore JSON parse errors
    }
    throw error;
  }
  return await res.json();
};