import { useEffect, useState } from "react";
import { useToast } from "./use-toast";
import {
  listOperadores,
  createOperador,
  updateOperador as updateOperadorSvc,
  toggleOperador as toggleOperadorSvc,
  type Operador,
} from "@/services/operadores";

export { Operador }; // para que los componentes sigan importando el tipo desde aquí

export const useOperadores = () => {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOperadores = async () => {
    try {
      setLoading(true);
      const data = await listOperadores();
      data.sort((a, b) => a.nombre.localeCompare(b.nombre));
      setOperadores(data);
    } catch (err) {
      console.error("Error cargando vendedores:", err);
      toast({
        title: "Error",
        description: "No se pudieron cargar los vendedores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarOperador = async (payload: Omit<Operador, "id" | "activo">) => {
    try {
      const creado = await createOperador(payload);
      setOperadores((prev) => [...prev, creado].sort((a, b) => a.nombre.localeCompare(b.nombre)));
      toast({
        title: "Vendedor agregado",
        description: `${payload.nombre} ha sido agregado al equipo`,
      });
    } catch (err: any) {
      console.error("Error agregando vendedor:", err);
      toast({
        title: "Error",
        description: err?.message || "No se pudo agregar el operador",
        variant: "destructive",
      });
    }
  };

  const actualizarOperador = async (id: string, data: Partial<Operador>) => {
    try {
      const actualizado = await updateOperadorSvc(id, data);
      setOperadores((prev) =>
        prev.map((op) => (op.id === id ? { ...op, ...actualizado } : op)),
      );
      toast({ title: "Vendedor actualizado", description: "Cambios guardados" });
    } catch (err: any) {
      console.error("Error actualizando vendedor:", err);
      toast({
        title: "Error",
        description: err?.message || "No se pudo actualizar el vendedor",
        variant: "destructive",
      });
    }
  };

  const toggleOperador = async (id: string, activo: boolean) => {
    try {
      const actualizado = await toggleOperadorSvc(id, activo);
      setOperadores((prev) =>
        prev.map((op) => (op.id === id ? { ...op, ...actualizado } : op)),
      );
      toast({
        title: actualizado.activo ? "Vendedor activado" : "Vendedor desactivado",
        description: "El cambio se ha guardado correctamente",
      });
    } catch (err: any) {
      console.error("Error cambiando estado:", err);
      toast({
        title: "Error",
        description: err?.message || "No se pudo cambiar el estado",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOperadores();
  }, []);

  return {
    operadores,
    loading,
    agregarOperador,
    actualizarOperador,
    toggleOperador,
    eliminarOperador: undefined, // añade si habilitas el endpoint
    refetch: fetchOperadores,
  };
};
