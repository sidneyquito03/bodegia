import { api } from "@/lib/api";

export type Cliente = {
  id: string;
  nombre: string;
  celular?: string | null;
  dni?: string | null;
  foto_url?: string | null;
  activo?: boolean;           // default true
  deuda_total: number;        // calculada en backend o persistida
  created_at?: string;        // alta del cliente
  updated_at?: string;
};

export type CrearClienteDTO = {
  nombre: string;
  celular?: string | null;
  dni?: string | null;
  foto_url?: string | null;
  deuda_inicial?: number;     // NUEVO: monto con el que arranca debiendo
};

export type RegistrarPagoDTO = {
  monto: number;
  descripcion?: string;
  metodoPago: "efectivo" | "yape" | "plin" | "tarjeta" | string;
  referencia?: string;
  comprobanteUrl?: string;
};

export type TransaccionFiado = {
  id: string;
  cliente_id: string;
  tipo: "fiado" | "pago";
  monto: number;
  descripcion?: string | null;
  metodo_pago?: string | null;
  referencia?: string | null;
  created_at: string;
  cliente?: { id: string; nombre: string };
};

export const listClientes = () =>
  api<Cliente[]>("/fiados/clientes", { method: "GET" });

export const createCliente = (dto: CrearClienteDTO) =>
  api<Cliente>("/fiados/clientes", {
    method: "POST",
    body: JSON.stringify(dto),
  });

export const registrarPagoCliente = (clienteId: string, dto: RegistrarPagoDTO) =>
  api<{ ok: true; cliente: Cliente }>(`/fiados/clientes/${clienteId}/pagos`, {
    method: "POST",
    body: JSON.stringify(dto),
  });

// (opcional) cambiar estado activo/inactivo
export const desactivarCliente = (clienteId: string) =>
  api<Cliente>(`/fiados/clientes/${clienteId}/desactivar`, { method: "POST" });

export const activarCliente = (clienteId: string) =>
  api<Cliente>(`/fiados/clientes/${clienteId}/activar`, { method: "POST" });

export const listTransaccionesFiados = (tipo?: "fiado" | "pago") => {
  const q = tipo ? `?tipo=${encodeURIComponent(tipo)}` : "";
  return api<TransaccionFiado[]>(`/fiados/transacciones${q}`, { method: "GET" });
};

export async function listTransaccionesFiadosPaged(params: {
  tipo?: "fiado" | "pago";
  from?: string; // YYYY-MM-DD
  to?: string;   // YYYY-MM-DD
  page?: number;
  limit?: number;
}) {
  const q = new URLSearchParams();
  if (params.tipo) q.set("tipo", params.tipo);
  if (params.from) q.set("from", params.from);
  if (params.to) q.set("to", params.to);
  q.set("page", String(params.page ?? 1));
  q.set("limit", String(params.limit ?? 20));
  return api<{ items: TransaccionFiado[]; total: number; page: number; pageSize: number }>(
    `/fiados/transacciones?${q.toString()}`,
    { method: "GET" }
  );}
