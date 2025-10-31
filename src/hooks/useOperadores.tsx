import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Operador {
  id: string;
  nombre: string;
  celular: string;
  activo: boolean;
}

export const useOperadores = () => {
  const [operadores, setOperadores] = useState<Operador[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchOperadores = async () => {
    try {
      const { data, error } = await supabase
        .from('operadores')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setOperadores(data || []);
    } catch (error) {
      console.error('Error cargando operadores:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los operadores",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarOperador = async (operador: Omit<Operador, 'id' | 'activo'>) => {
    try {
      const { error } = await supabase
        .from('operadores')
        .insert([{ ...operador, activo: true }]);

      if (error) throw error;

      toast({
        title: "Operador agregado",
        description: `${operador.nombre} ha sido agregado al equipo`,
      });

      fetchOperadores();
    } catch (error: any) {
      console.error('Error agregando operador:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el operador",
        variant: "destructive",
      });
    }
  };

  const toggleOperador = async (id: string, activo: boolean) => {
    try {
      const { error } = await supabase
        .from('operadores')
        .update({ activo: !activo })
        .eq('id', id);

      if (error) throw error;

      toast({
        title: activo ? "Operador desactivado" : "Operador activado",
        description: "El cambio se ha guardado correctamente",
      });

      fetchOperadores();
    } catch (error: any) {
      console.error('Error cambiando estado:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo cambiar el estado",
        variant: "destructive",
      });
    }
  };

  const eliminarOperador = async (id: string) => {
    try {
      const { error } = await supabase
        .from('operadores')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Operador eliminado",
        description: "El operador ha sido eliminado del sistema",
      });

      fetchOperadores();
    } catch (error: any) {
      console.error('Error eliminando operador:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo eliminar el operador",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchOperadores();

    const channel = supabase
      .channel('operadores-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'operadores'
        },
        () => {
          fetchOperadores();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    operadores,
    loading,
    agregarOperador,
    toggleOperador,
    eliminarOperador,
    refetch: fetchOperadores,
  };
};
