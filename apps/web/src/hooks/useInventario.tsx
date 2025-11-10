import { useEffect, useState } from "react";
import {
  listProductos,
  createProducto,
  updateProducto,
  deleteProducto,
  type Producto,
  type CrearProductoDTO,
  type ActualizarProductoDTO,
} from "@/services/inventory";
import { useToast } from "@/hooks/use-toast";

export type { Producto };

export function useInventario() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  async function cargar() {
    try {
      setLoading(true);
      setError(null);
      const data = await listProductos();

      // Fallback de estado si el backend aún no lo calcula
      const now = Date.now();
      const withEstado = data.map((p) => {
        if (p.estado) return p;
        let estado: Producto["estado"] = "Disponible";
        if (p.stock <= 0) estado = "Stock Crítico";
        else if (p.stock < (p.stock_bajo ?? 10)) estado = "Stock Bajo";

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
      setError(e?.message ?? "Error al cargar inventario");
      toast({
        title: "Error",
        description: e?.message ?? "No se pudieron cargar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function agregarProducto(dto: CrearProductoDTO) {
    try {
      const nuevo = await createProducto(dto);
      setProductos((prev) => [nuevo, ...prev]);
      toast({
        title: "Producto agregado",
        description: `${nuevo.nombre} ha sido agregado al inventario`,
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message ?? "No se pudo agregar el producto",
        variant: "destructive",
      });
      throw e;
    }
  }

  async function actualizarProducto(id: string, dto: ActualizarProductoDTO, motivo?: string) {
    try {
      const anterior = productos.find((p) => p.id === id);

      const upd = await updateProducto(id, {
        ...dto,
        ...(motivo ? { motivo_precio: motivo } : {}),
      });

      setProductos((prev) => prev.map((p) => (p.id === id ? upd : p)));
      toast({ title: "Producto actualizado", description: "Los cambios se guardaron correctamente" });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message ?? "No se pudo actualizar el producto",
        variant: "destructive",
      });
      throw e;
    }
  }

  async function eliminarProducto(id: string) {
    try {
      await deleteProducto(id);
      setProductos((prev) => prev.filter((p) => p.id !== id));
      toast({
        title: "Producto eliminado",
        description: "El producto ha sido eliminado del inventario",
      });
    } catch (e: any) {
      toast({
        title: "Error",
        description: e?.message ?? "No se pudo eliminar el producto",
        variant: "destructive",
      });
      throw e;
    }
  }

  return {
    productos,
    loading,
    error,
    cargar,
    agregarProducto,
    actualizarProducto,
    eliminarProducto,
  };
}
