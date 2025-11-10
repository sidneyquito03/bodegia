import { useEffect, useRef, useState } from "react";
import { useToast } from "@/hooks/use-toast";
import {
  listProveedores,
  createProveedor,
  updateProveedor,
  listComprasProveedor,
  createCompraProveedor,
  updateCompraProveedor,
  type Proveedor,
  type CompraProveedor,
} from "@/services/providers";

export type { Proveedor, CompraProveedor }; 

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [compras, setCompras] = useState<CompraProveedor[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const pollRef = useRef<number | null>(null);

  const fetchProveedores = async () => {
    try {
      const data = await listProveedores();
      setProveedores((data ?? []).map(p => ({ ...p, id: String(p.id) })));
    } catch (error) {
      console.error("Error cargando proveedores:", error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los proveedores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchCompras = async (proveedorId?: string) => {
    try {
      const data = await listComprasProveedor(proveedorId);
      setCompras((data ?? []).map(c => ({ ...c, id: String(c.id) })));
    } catch (error) {
      console.error("Error cargando compras:", error);
    }
  };

  const agregarProveedor = async (body: Omit<Proveedor, "id" | "created_at" | "updated_at">) => {
    await createProveedor(body);
    toast({ title: "Proveedor agregado", description: `${body.nombre} agregado correctamente` });
    await fetchProveedores();
  };

  const actualizarProveedor = async (id: string, updates: Partial<Proveedor>) => {
    await updateProveedor(id, updates);
    toast({ title: "Proveedor actualizado", description: "Cambios guardados" });
    await fetchProveedores();
  };

  const toggleProveedor = async (id: string, activo: boolean) => {
    await actualizarProveedor(id, { activo: !activo });
  };

  const registrarCompra = async (c: Omit<CompraProveedor, "id" | "created_at">) => {
    await createCompraProveedor(c);
    toast({ title: "Compra registrada", description: "Se registró correctamente" });
    await fetchCompras();
  };

  const actualizarCompra = async (id: string, updates: Partial<CompraProveedor>) => {
    await updateCompraProveedor(id, updates);
    toast({ title: "Compra actualizada", description: "Cambios guardados" });
    await fetchCompras();
  };

  useEffect(() => {
    fetchProveedores();
    fetchCompras();

    if (!pollRef.current) {
      pollRef.current = window.setInterval(() => {
        fetchProveedores();
        fetchCompras();
      }, 15000);
    }
    return () => {
      if (pollRef.current) {
        clearInterval(pollRef.current);
        pollRef.current = null;
      }
    };
  }, []);

  return {
    proveedores,
    compras,
    loading,
    agregarProveedor,
    actualizarProveedor,
    toggleProveedor,
    registrarCompra,
    actualizarCompra,
    fetchCompras,
    refetch: fetchProveedores,
  };
};
