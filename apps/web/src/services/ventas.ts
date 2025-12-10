import { api } from "@/lib/api";

export type ItemVenta = {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio_unitario: number;
};

export type CrearVentaDto = {
  items: ItemVenta[];
  metodo_pago?: "efectivo" | "tarjeta" | "yape" | "plin" | "transferencia";
  tipo: "Cobrado" | "Fiado";
  cliente_id?: string;
};

export type VentaCreada = {
  id: string;
  total: number;
  metodo_pago: string;
  tipo: "Cobrado" | "Fiado";
  cliente_id?: string | null;
  created_at: string;
};

export async function crearVenta(dto: CrearVentaDto) {
  return api<VentaCreada>("/ventas", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
