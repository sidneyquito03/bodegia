import { useState } from "react";
//import { supabase } from "@/integrations/supabase/client";
import { useToast } from "./use-toast";

export interface ItemVenta {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
}

export const useVentas = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const registrarVenta = async (
    items: ItemVenta[],
    tipo: 'efectivo' | 'fiado',
    clienteId?: string
  ) => {
    setLoading(true);
    try {
      const subtotal = items.reduce((sum, item) => sum + (item.precio * item.cantidad), 0);

      // Insertar venta
      const { error: ventaError } = await supabase
        .from('ventas')
        .insert([{
          tipo,
          cliente_id: clienteId,
          subtotal,
          total: subtotal,
          items: items as any
        }]);

      if (ventaError) throw ventaError;

      // Actualizar stock de productos
      for (const item of items) {
        const { data: producto } = await supabase
          .from('productos')
          .select('stock')
          .eq('id', item.producto_id)
          .single();

        if (producto) {
          const nuevoStock = producto.stock - item.cantidad;
          await supabase
            .from('productos')
            .update({ stock: nuevoStock })
            .eq('id', item.producto_id);
        }
      }

      // Si es fiado, actualizar deuda del cliente
      if (tipo === 'fiado' && clienteId) {
        const { data: cliente } = await supabase
          .from('clientes')
          .select('deuda_total')
          .eq('id', clienteId)
          .single();

        if (cliente) {
          await supabase
            .from('clientes')
            .update({ deuda_total: cliente.deuda_total + subtotal })
            .eq('id', clienteId);

          await supabase
            .from('transacciones_fiados')
            .insert([{
              cliente_id: clienteId,
              tipo: 'fiado',
              monto: subtotal,
              descripcion: 'Venta fiada',
              estado: 'pendiente'
            }]);
        }
      }

      toast({
        title: "Venta registrada",
        description: `Venta de S/. ${subtotal.toFixed(2)} registrada correctamente`,
      });

      return true;
    } catch (error: any) {
      console.error('Error registrando venta:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudo registrar la venta",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    registrarVenta,
    loading,
  };
};
