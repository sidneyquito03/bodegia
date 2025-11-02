import { api } from "@/lib/api";

export type ItemVenta = {
  producto_id: string;
  nombre: string;
  cantidad: number;
  precio: number;
};

export type CrearVentaDto = {
  items: ItemVenta[];
  tipo: "efectivo" | "fiado";
  cliente_id?: string;
};

export type VentaCreada = {
  id: string;
  subtotal: number;
  total: number;
  tipo: "efectivo" | "fiado";
  cliente_id?: string | null;
  created_at: string;
};

export async function crearVenta(dto: CrearVentaDto) {
  return api<VentaCreada>("/ventas", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}
