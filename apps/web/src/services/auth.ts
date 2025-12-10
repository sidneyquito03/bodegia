import { api } from '../lib/api';

export type LoginDTO = { email: string; password: string };
export type User = { id: string; email: string; name?: string; role?: string };

export async function login(dto: LoginDTO) {
  const data = await api<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  localStorage.setItem('token', data.token);
  localStorage.setItem('user', JSON.stringify(data.user));
  return data.user;
}

export async function me() {
  const data = await api<{ user: User }>('/auth/me', { method: 'GET' });
  return data.user;
}

export async function logout() {
  try {
    await api<void>('/auth/logout', { method: 'POST' });
  } catch {
    // Logout can fail, we still clear local storage
  }
  localStorage.removeItem('token');
  localStorage.removeItem('user');
}

export function getCurrentUser(): User | null {
  const user = localStorage.getItem('user');
  return user ? JSON.parse(user) : null;
}

