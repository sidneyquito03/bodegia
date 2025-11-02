import { api } from "@/lib/api";

export interface Operador {
  id: string;
  nombre: string;
  celular: string;
  activo: boolean;
  email?: string | null;
  dni?: string | null;
  direccion?: string | null;
}

export async function listOperadores() {
  return api<Operador[]>("/operators", { method: "GET" });
}

export async function createOperador(dto: Omit<Operador, "id" | "activo">) {
  return api<Operador>("/operators", {
    method: "POST",
    body: JSON.stringify({ ...dto, activo: true }),
  });
}

export async function updateOperador(id: string, dto: Partial<Operador>) {
  return api<Operador>(`/operators/${id}`, {
    method: "PUT",
    body: JSON.stringify(dto),
  });
}

export async function toggleOperador(id: string, activo: boolean) {
  return api<Operador>(`/operators/${id}/toggle`, {
    method: "PUT",
    body: JSON.stringify({ activo: !activo }),
  });
}

export async function deleteOperador(id: string) {
  return api<void>(`/operators/${id}`, { method: "DELETE" });
}
