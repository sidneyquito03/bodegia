import { useEffect, useMemo, useState } from "react";
import {
  listProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  type Producto,
  type CrearProductoDTO,
  type ActualizarProductoDTO,
} from "@/services/inventory";

export type { Producto };

export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    try {
      setLoading(true);
      setError(null);
      const data = await listProductos();

      // Si el backend aún no calcula "estado", lo inferimos aquí como fallback
      const now = Date.now();
      const withEstado = data.map((p) => {
        if (p.estado) return p;
        let estado: Producto["estado"] = "Disponible";
        if (p.stock <= 0) estado = "Stock Crítico";
        else if (p.stock < 10) estado = "Stock Bajo";
        // opcional: si tiene fecha de caducidad cercana, lo marcamos
        if (p.fecha_vencimiento) {
          const ms = new Date(p.fecha_vencimiento).getTime() - now;
          const dias = ms / (1000 * 60 * 60 * 24);
          if (dias <= 0) estado = "Stock Crítico";
          else if (dias <= 7 && estado === "Disponible") estado = "Stock Bajo";
        }
        return { ...p, estado };
      });

      setProductos(withEstado);
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregarProducto(dto: CrearProductoDTO) {
    const nuevo = await createProducto(dto);
    setProductos((prev) => [nuevo, ...prev]);
  }

  async function actualizarProducto(id: string, dto: ActualizarProductoDTO) {
    const upd = await updateProducto(id, dto);
    setProductos((prev) => prev.map((p) => (p.id === id ? upd : p)));
  }

  async function eliminarProducto(id: string) {
    await deleteProducto(id);
    setProductos((prev) => prev.filter((p) => p.id !== id));
  }

  return { productos, loading, error, cargar, agregarProducto, actualizarProducto, eliminarProducto };
}
