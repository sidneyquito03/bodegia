import { api } from '../lib/api';

export type LoginDTO = { email: string; password: string };
export type User = { id: string; email: string; name?: string };

export async function login(dto: LoginDTO) {
  const data = await api<{ token: string; user: User }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(dto),
  });
  localStorage.setItem('token', data.token);
  return data.user;
}

export async function me() {
  return api<{ user: User }>('/auth/me', { method: 'GET' });
}

export async function logout() {
  await api<void>('/auth/logout', { method: 'POST' });
  localStorage.removeItem('token');
}
