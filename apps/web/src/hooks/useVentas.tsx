import { useState } from "react";
import { useToast } from "./use-toast";
import { crearVenta, type ItemVenta } from "@/services/ventas";

export { ItemVenta }; // si otros archivos importan el tipo desde aquí

export const useVentas = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const registrarVenta = async (
    items: ItemVenta[],
    tipo: "Cobrado" | "Fiado",
    clienteId?: string,
    metodoPago: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia" = "efectivo"
  ) => {
    setLoading(true);
    try {
      const res = await crearVenta({
        items,
        tipo,
        metodo_pago: metodoPago,
        cliente_id: tipo === "Fiado" ? clienteId : undefined,
      });

      toast({
        title: "Venta registrada",
        description: `Venta de S/. ${res.total.toFixed(2)} (${tipo})`,
      });

      return true;
    } catch (err: any) {
      console.error("Error registrando venta:", err);
      toast({
        title: "Error",
        description: err?.message || "No se pudo registrar la venta",
        variant: "destructive",
      });
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { registrarVenta, loading };
};
