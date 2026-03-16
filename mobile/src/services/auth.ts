import * as SecureStore from 'expo-secure-store';
import api from './api';

const TOKEN_KEY = 'carbon_token';

interface LoginResponse {
  token: string;
  expiresIn: number;
}

export async function login(email: string, password: string): Promise<void> {
  const response = await api.post<LoginResponse>('/auth/login', { email, password });
  await SecureStore.setItemAsync(TOKEN_KEY, response.data.token);
}

export async function register(
  fullName: string,
  email: string,
  password: string
): Promise<void> {
  await api.post('/auth/register', { fullName, email, password });
}

export async function logout(): Promise<void> {
  await SecureStore.deleteItemAsync(TOKEN_KEY);
}

export async function getToken(): Promise<string | null> {
  return SecureStore.getItemAsync(TOKEN_KEY);
}
