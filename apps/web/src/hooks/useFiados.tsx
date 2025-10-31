import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface Cliente {
  id: string;
  nombre: string;
  celular: string | null;
  deuda_total: number;
  foto_url?: string | null;
  dni?: string | null;
  email?: string | null;
  direccion?: string | null;
  notas?: string | null;
  activo?: boolean;
  created_at?: string;
}

export interface Transaccion {
  id: string;
  cliente_id: string;
  tipo: 'fiado' | 'pago';
  monto: number;
  descripcion: string | null;
  estado: string;
  created_at: string;
}

export const useFiados = () => {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  const fetchClientes = async () => {
    try {
      const { data, error } = await supabase
        .from('clientes')
        .select('*')
        .order('nombre');

      if (error) throw error;
      setClientes(data || []);
    } catch (error) {
      console.error('Error cargando clientes:', error);
      toast({
        title: "Error",
        description: "No se pudieron cargar los clientes",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const agregarCliente = async (cliente: Omit<Cliente, 'id' | 'deuda_total'>) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .insert([{ ...cliente, deuda_total: 0 }]);

      if (error) throw error;

      toast({
        title: "Cliente agregado",
        description: `${cliente.nombre} ha sido agregado`,
      });

      fetchClientes();
    } catch (error: any) {
      console.error('Error agregando cliente:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo agregar el cliente",
        variant: "destructive",
      });
    }
  };

  const registrarCliente = async (clienteData: any) => {
    try {
      const { error } = await supabase
        .from('clientes')
        .insert([clienteData]);

      if (error) throw error;

      toast({
        title: "Cliente registrado",
        description: "El cliente se ha registrado correctamente",
      });

      fetchClientes();
      return true;
    } catch (error) {
      console.error('Error registrando cliente:', error);
      toast({
        title: "Error",
        description: "No se pudo registrar el cliente",
        variant: "destructive",
      });
      return false;
    }
  };

  const registrarPago = async (
    clienteId: string, 
    monto: number, 
    descripcion?: string,
    metodoPago: string = 'efectivo',
    referencia?: string,
    comprobanteUrl?: string
  ) => {
    try {
      const { error: transError } = await supabase
        .from('transacciones_fiados')
        .insert([{
          cliente_id: clienteId,
          tipo: 'pago',
          monto,
          descripcion: descripcion || `Pago de S/. ${monto.toFixed(2)}`,
          estado: 'completado',
          metodo_pago: metodoPago,
          referencia_transaccion: referencia,
          comprobante_url: comprobanteUrl
        }]);

      if (transError) throw transError;

      // Actualizar deuda del cliente
      const cliente = clientes.find(c => c.id === clienteId);
      if (cliente) {
        const nuevaDeuda = Math.max(0, cliente.deuda_total - monto);
        const { error: updateError } = await supabase
          .from('clientes')
          .update({ deuda_total: nuevaDeuda })
          .eq('id', clienteId);

        if (updateError) throw updateError;
      }

      toast({
        title: "Pago registrado",
        description: `Se registró un pago de S/. ${monto.toFixed(2)}`,
      });

      fetchClientes();
    } catch (error: any) {
      console.error('Error registrando pago:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar el pago",
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    fetchClientes();

    const channel = supabase
      .channel('clientes-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'clientes'
        },
        () => {
          fetchClientes();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  return {
    clientes,
    loading,
    agregarCliente,
    registrarCliente,
    registrarPago,
    refetch: fetchClientes,
  };
};
