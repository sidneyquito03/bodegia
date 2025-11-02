import { api } from "@/lib/api";

export type Producto = {
  id: string;
  nombre: string;
  codigo: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
  categoria: string;
  estado?: "Disponible" | "Stock Bajo" | "Stock Crítico";
  fecha_vencimiento?: string | null;
  fecha_ingreso?: string | null; // la pone el backend (created_at)
  marca?: string | null;
  unidad?: string | null; //“unidad”, “caja”, “kg”
};

export type HistorialPrecio = {
  id: string;
  producto_id: string;
  precio_costo_anterior: number;
  precio_venta_anterior: number;
  precio_costo_nuevo: number;
  precio_venta_nuevo: number;
  motivo?: string | null;
  created_at: string; // ISO
};

export type CrearProductoDTO = Omit<Producto, "id" | "estado"> & { estado?: Producto["estado"] };
export type ActualizarProductoDTO = Partial<CrearProductoDTO>;

export const listProductos = () => api<Producto[]>("/inventory", { method: "GET" });
export const listCategorias = () => api<string[]>("/inventory/categories", { method: "GET" });

export const createProducto = (data: CrearProductoDTO) =>
  api<Producto>("/inventory", { method: "POST", body: JSON.stringify(data) });

export const updateProducto = (id: string, data: ActualizarProductoDTO) =>
  api<Producto>(`/inventory/${id}`, { method: "PUT", body: JSON.stringify(data) });

export const deleteProducto = (id: string) =>
  api<void>(`/inventory/${id}`, { method: "DELETE" });

// Historial de precios (si lo manejas)
export type PrecioHist = { fecha: string; precio_costo: number; precio_venta: number };
export const getHistorialPrecios = (id: string) =>
  api<PrecioHist[]>(`/inventory/${id}/price-history`, { method: "GET" });

// Carga masiva (Excel) – enviamos el archivo al backend

export const importProductosJson = (rows: any[]) =>
  api<{ inserted: number; updated: number }>("/inventory/import-json", {
    method: "POST",
    body: JSON.stringify({ rows }),
  });

export const importProductosExcel = (file: File) => {
  const form = new FormData();
  form.append("file", file);
  const url = `${import.meta.env.VITE_API_BASE_URL}/inventory/import`;
  const token = localStorage.getItem("token");
  return fetch(url, {
    method: "POST",
    body: form,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  }).then((r) => {
    if (!r.ok) throw new Error(`API ${r.status}`);
    return r.json() as Promise<{ inserted: number; updated: number }>;
  });
};

  export function getPriceHistory(productoId: string) {
  return api<HistorialPrecio[]>(`/inventory/${productoId}/price-history`, {
    method: "GET",
  });

  
}
