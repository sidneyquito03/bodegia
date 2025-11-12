import { api } from "@/lib/api";

export interface Proveedor {
  id: string;
  nombre: string;
  ruc?: string;
  contacto?: string;
  telefono?: string;
  email?: string;
  direccion?: string;
  tiempo_entrega_dias: number;
  notas?: string;
  activo: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CompraProveedor {
  id: string;
  proveedor_id: string;
  producto_id: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha_pedido: string;
  fecha_entrega_estimada?: string;
  fecha_entrega_real?: string;
  estado: string;
  notas?: string;
  created_at?: string;
}

// Endpoints REST (ajusta si tu backend usa otros)
export async function listProveedores(activos?: boolean) {
  const q = activos ? "?activos=1" : "";
  return api<{id: string; nombre: string; activo: boolean}[]>(`/proveedores${q}`);
}


export async function createProveedor(body: Omit<Proveedor, "id" | "created_at" | "updated_at">) {
  return api<Proveedor>("/proveedores", { method: "POST", body: JSON.stringify(body) });
}

export async function updateProveedor(id: string, body: Partial<Proveedor>) {
  return api<Proveedor>(`/proveedores/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}

export async function listComprasProveedor(proveedorId?: string): Promise<CompraProveedor[]> {
  const q = proveedorId ? `?proveedor_id=${encodeURIComponent(proveedorId)}` : "";
  return api<CompraProveedor[]>(`/compras-proveedores${q}`, { method: "GET" });
}

export async function createCompraProveedor(body: Omit<CompraProveedor, "id" | "created_at">) {
  return api<CompraProveedor>("/compras-proveedores", { method: "POST", body: JSON.stringify(body) });
}

export async function updateCompraProveedor(id: string, body: Partial<CompraProveedor>) {
  return api<CompraProveedor>(`/compras-proveedores/${id}`, { method: "PATCH", body: JSON.stringify(body) });
}
