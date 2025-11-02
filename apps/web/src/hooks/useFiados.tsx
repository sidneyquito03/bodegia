import { useEffect, useState } from "react";
import {
  listClientes,
  createCliente,
  registrarPagoCliente,
  type Cliente,
  type CrearClienteDTO,
  type RegistrarPagoDTO,
} from "@/services/fiados";

export type { Cliente };

export function useFiados() {
  const [clientes, setClientes] = useState<Cliente[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  async function cargar() {
    try {
      setLoading(true);
      setError(null);
      const data = await listClientes();
      // Orden sugerido: primero los que deben más
      data.sort((a, b) => b.deuda_total - a.deuda_total);
      setClientes(data);
    } catch (e: any) {
      setError(e.message ?? "Error");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  async function registrarCliente(dto: CrearClienteDTO) {
    const nuevo = await createCliente(dto);
    setClientes((prev) => [nuevo, ...prev]);
  }

  async function registrarPago(
    clienteId: string,
    monto: number,
    descripcion: string,
    metodoPago: string,
    referencia?: string,
    comprobanteUrl?: string
  ) {
    const dto: RegistrarPagoDTO = { monto, descripcion, metodoPago, referencia, comprobanteUrl };
    const res = await registrarPagoCliente(clienteId, dto);
    setClientes((prev) => prev.map((c) => (c.id === clienteId ? res.cliente : c)));
  }

  return { clientes, loading, error, cargar, registrarPago, registrarCliente };
}
