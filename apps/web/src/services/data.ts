import { api } from "@/lib/api";

export type Venta = { total: number; created_at: string };
export type Cliente = { deuda_total: number; nombre?: string };
export type Producto = { stock: number };
export type TransaccionFiado = { metodo_pago: string; created_at: string };

export async function fetchVentas(desdeISO: string) {
  return api<Venta[]>(`/ventas?since=${encodeURIComponent(desdeISO)}`, { method: "GET" });
}
export async function fetchClientes() {
  return api<Cliente[]>(`/clientes`, { method: "GET" });
}
export async function fetchProductos() {
  return api<Producto[]>(`/productos`, { method: "GET" });
}
export async function fetchTransaccionesFiados(desdeISO: string) {
  return api<TransaccionFiado[]>(`/fiados/transacciones?since=${encodeURIComponent(desdeISO)}`, { method: "GET" });
}
