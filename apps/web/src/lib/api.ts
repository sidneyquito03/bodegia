const getApiBaseUrl = () => {
  if (typeof window !== 'undefined' && window.__API_BASE_URL__) {
    return window.__API_BASE_URL__;
  }
  return import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000';
};

export const API_BASE_URL = getApiBaseUrl();

export async function api<T = unknown>(path: string, init?: RequestInit): Promise<T> {
  const token = localStorage.getItem('token');
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(init?.headers || {}),
    },
    ...init,
  });
  if (!res.ok) {
    // Try to parse error body for a helpful message
    let body: any = undefined;
    try {
      body = await res.json();
    } catch (_) {
      body = await res.text().catch(() => undefined);
    }
    const msg = body && body.message ? body.message : typeof body === 'string' ? body : `API ${res.status}`;
    throw new Error(msg);
  }

  return (res.status === 204 ? undefined : await res.json()) as T;
}

export const http = {
  get: <T>(path: string) => api<T>(path, { method: 'GET' }),
  post: <T>(path: string, body?: unknown) =>
    api<T>(path, { method: 'POST', body: JSON.stringify(body ?? {}) }),
  patch: <T>(path: string, body?: unknown) =>
    api<T>(path, { method: 'PATCH', body: JSON.stringify(body ?? {}) }),
  put: <T>(path: string, body?: unknown) =>
    api<T>(path, { method: 'PUT', body: JSON.stringify(body ?? {}) }),
  delete: <T>(path: string) => api<T>(path, { method: 'DELETE' }),
};
