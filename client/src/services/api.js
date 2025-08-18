import axios from 'axios';
const API_URL = 'https://webd-task1.onrender.com'

const api = axios.create({
  baseURL: `${API_URL || ''}/api/v1`,
});

api.interceptors.request.use((config)=>{
  const token = localStorage.getItem('token');
  if(token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

export default api;