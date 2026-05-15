import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'https://qingling-api-production.up.railway.app';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  timeout: 10000,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const login = async (email, password) => {
  const { data } = await api.post('/auth/login', { email, password });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data;
};

export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
};

export const getUser = () => {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
};

export const isAuthenticated = () => !!localStorage.getItem('token');

export const getTrucks = () => api.get('/trucks').then(r => r.data.trucks || []);
export const getTruck = (slug) => api.get(`/trucks/${slug}`).then(r => r.data.truck);
export const createTruck = (data) => api.post('/trucks', data).then(r => r.data.truck);
export const updateTruck = (id, data) => api.put(`/trucks/${id}`, data).then(r => r.data.truck);
export const deleteTruck = (id) => api.delete(`/trucks/${id}`).then(r => r.data);

export const getPages = () => api.get('/pages').then(r => r.data.pages || []);
export const getPage = (slug) => api.get(`/pages/${slug}`).then(r => r.data.page);
export const updatePage = (slug, data) => api.put(`/pages/${slug}`, data).then(r => r.data.page);

export default api;
