import { api } from "@/lib/api";

export type EstadoProducto =
  | "Disponible"
  | "Stock Bajo"
  | "Stock Crítico"
  | "Agotado"
  | "Vencido";

export interface Producto {
  id: string;
  nombre: string;
  codigo: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
  categoria: string;
  estado: EstadoProducto;
  imagen_url?: string | null;
  proveedor_id?: string | null;
  fecha_vencimiento?: string | null; 
  marca?: string | null;
  medida_peso?: string | null;
  stock_critico?: number;
  stock_bajo?: number;
  created_at?: string;
  updated_at?: string;
}

export interface CrearProductoDTO {
  nombre: string;
  codigo: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
  categoria: string;
  estado?: EstadoProducto;
  imagen_url?: string | null;
  proveedor_id?: string | null;
  proveedor_nombre?: string | null; 
  fecha_vencimiento?: string | null;
  marca?: string | null;
  medida_peso?: string | null;
  stock_critico?: number;
  stock_bajo?: number;
}

export interface ActualizarProductoDTO extends Partial<CrearProductoDTO> {}

export interface ImportProductosInput extends CrearProductoDTO {}
export interface ImportProductosResult {
  inserted: number;
  updated: number;
  errors?: number;
  details?: Array<{ index: number; message: string }>;
}

export interface PriceHistoryDTO {
  producto_id: string;
  precio_costo_anterior: number;
  precio_venta_anterior: number;
  precio_costo_nuevo: number;
  precio_venta_nuevo: number;
  motivo: string;
}

export async function listProductos(): Promise<Producto[]> {
  return api<Producto[]>("/inventory");
}

export async function createProducto(dto: CrearProductoDTO): Promise<Producto> {
  return api<Producto>("/inventory", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function updateProducto(
  id: string,
  dto: ActualizarProductoDTO & { motivo_precio?: string }
): Promise<Producto> {
  return api<Producto>(`/inventory/${id}`, {
    method: "PATCH",
    body: JSON.stringify(dto),
  });
}

export async function deleteProducto(id: string): Promise<void> {
  await api(`/inventory/${id}`, { method: "DELETE" });
}

export async function listCategorias(): Promise<string[]> {
  return api<string[]>("/inventory-categories");
}

export async function createPriceHistory(dto: PriceHistoryDTO) {
  return api("/inventory-price-history", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
export async function importProductosJson(items: ImportProductosInput[]): Promise<ImportProductosResult> {
  try {
    return await api<ImportProductosResult>("/inventory/import-json", {
      method: "POST",
      body: JSON.stringify({ items }),
    });
  } catch (e: any) {
    console.warn("Bulk import endpoint failed. Falling back to sequential creation.", e);
    let inserted = 0;
    let updated = 0;
    const details: ImportProductosResult["details"] = [];

    for (let i = 0; i < items.length; i++) {
      const row = items[i];
      try {
        await createProducto(row);
        inserted++;
      } catch (err: any) {
        details?.push({ 
            index: i, 
            message: err?.message || `Error en fila ${i + 1}: Falló la creación.` 
        });
      }
    }

    return { inserted, updated, errors: details.length, details };
  }
}
export async function importProductosExcel(file: File): Promise<ImportProductosResult> {
  const form = new FormData();
  form.append("file", file);

  return api<ImportProductosResult>("/inventory/import-excel", {
    method: "POST",
    body: form,
    headers: { } as any,
  });
}