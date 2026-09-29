const API_BASE = 'http://localhost:5000/api';

function getAuthToken() {
  return localStorage.getItem('eventhub_token') || '';
}

async function apiRequest(endpoint, options = {}) {
  const token = getAuthToken();
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  const config = {
    ...options,
    headers
  };

  if (options.body && typeof options.body === 'object') {
    config.body = JSON.stringify(options.body);
  }

  try {
    const response = await fetch(`${API_BASE}${endpoint}`, config);
    const data = await response.json();

    if (!response.ok) {
      const error = new Error(data.message || `Request failed with status ${response.status}`);
      error.status = response.status;
      error.data = data;
      throw error;
    }

    return data;
  } catch (err) {
    if (!err.status && err.message === 'Failed to fetch') {
      err.message = 'Unable to connect to EventHub API. Please make sure the backend server is running.';
    }
    throw err;
  }
}

export const api = {
  // Auth
  login: (email, password) => apiRequest('/auth/login', { method: 'POST', body: { email, password } }),
  register: (payload) => apiRequest('/auth/register', { method: 'POST', body: payload }),
  getProfile: () => apiRequest('/auth/profile', { method: 'GET' }),
  updateProfile: (payload) => apiRequest('/auth/profile', { method: 'PUT', body: payload }),

  // Events
  getEvents: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiRequest(`/events?${query.toString()}`, { method: 'GET' });
  },
  getEventById: (id) => apiRequest(`/events/${id}`, { method: 'GET' }),
  createEvent: (payload) => apiRequest('/events', { method: 'POST', body: payload }),
  updateEvent: (id, payload) => apiRequest(`/events/${id}`, { method: 'PUT', body: payload }),
  deleteEvent: (id) => apiRequest(`/events/${id}`, { method: 'DELETE' }),
  getAdminStats: () => apiRequest('/events/admin/stats', { method: 'GET' }),

  // Registrations
  registerForEvent: (eventId, notes = '') => apiRequest(`/registrations/${eventId}`, { method: 'POST', body: { notes } }),
  cancelRegistration: (eventId) => apiRequest(`/registrations/${eventId}/cancel`, { method: 'PUT' }),
  getMyRegistrations: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiRequest(`/registrations/my-registrations?${query.toString()}`, { method: 'GET' });
  },
  getEventParticipants: (eventId, params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiRequest(`/registrations/events/${eventId}/participants?${query.toString()}`, { method: 'GET' });
  },
  getAllParticipants: (params = {}) => {
    const query = new URLSearchParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val !== undefined && val !== null && val !== '') {
        query.append(key, val);
      }
    });
    return apiRequest(`/registrations/admin/all-participants?${query.toString()}`, { method: 'GET' });
  },
  updateRegistrationStatus: (id, status) => apiRequest(`/registrations/${id}/status`, { method: 'PATCH', body: { status } })
};
