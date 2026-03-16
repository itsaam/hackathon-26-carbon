import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const api = axios.create({
  baseURL: 'http://localhost:8080/api'
});

api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('carbon_token');
  if (token) {
    config.headers = {
      ...config.headers,
      Authorization: `Bearer ${token}`
    };
  }
  return config;
});

export default api;
