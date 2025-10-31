export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:3000'
export async function api<T=unknown>(path:string, init?:RequestInit):Promise<T>{
  const res = await fetch(`${API_BASE_URL}${path}`, {
    headers: { 'Content-Type':'application/json', ...(init?.headers||{}) },
    ...init,
  })
  if(!res.ok) throw new Error(`API ${res.status}`)
  return res.json() as Promise<T>
}
