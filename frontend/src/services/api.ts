import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
  getProfile: () => api.get('/auth/profile'),
};

// Farm API
export const farmAPI = {
  create: (data: any) => api.post('/farms', data),
  getAll: () => api.get('/farms'),
  getById: (id: number) => api.get(`/farms/${id}`),
  getSatelliteData: (id: number) => api.get(`/farms/${id}/satellite`),
};

// Loan API
export const loanAPI = {
  create: (data: any) => api.post('/loans', data),
  getMyLoans: () => api.get('/loans/my-loans'),
  getPending: () => api.get('/loans/pending'),
  getById: (id: number) => api.get(`/loans/${id}`),
  approve: (id: number) => api.post(`/loans/${id}/approve`),
  reject: (id: number) => api.post(`/loans/${id}/reject`),
};

export default api;
