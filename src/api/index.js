import axios from 'axios';
import { getAuthToken } from '../utils/authStorage';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';
const api = axios.create({ baseURL: apiBaseUrl });

api.interceptors.request.use((config) => {
  const token = getAuthToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export const fetchJobs   = (params) => api.get('/jobs', { params });
export const createJob   = (data)   => api.post('/jobs', data);
export const applyToJob  = (data)   => api.post('/applications', data, {
  headers: { 'Content-Type': 'multipart/form-data' },
});

export const registerUser = (data) => api.post('/auth/register', data);
export const loginUser = (data) => api.post('/auth/login', data);
export const fetchMe = () => api.get('/auth/me');