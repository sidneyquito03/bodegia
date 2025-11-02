import { api, API_BASE_URL } from "@/lib/api";
export async function uploadPublicFile(file: File): Promise<string | null> {
  const form = new FormData();
  form.append("file", file);
  const res = await fetch(`${API_BASE_URL}/files`, { method: "POST", body: form });
  if (!res.ok) return null;
  const data = (await res.json()) as { url?: string };
  return data.url ?? null;
}

/*export async function uploadPublicFile(file: File): Promise<string | undefined> {
  const url = `${import.meta.env.VITE_API_BASE_URL}/files`;
  const form = new FormData();
  form.append("file", file);

  try {
    const token = localStorage.getItem("token");
    const res = await fetch(url, {
      method: "POST",
      body: form,
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = (await res.json()) as { url: string };
    return data.url;
  } catch {
    return undefined; 
  }
}*/
