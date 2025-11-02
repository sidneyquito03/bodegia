export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token')
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  })
  if (!res.ok) throw new Error(`API ${res.status}`)
  return (res.status === 204 ? undefined : await res.json()) as T
}
