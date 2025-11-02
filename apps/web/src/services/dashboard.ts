import { api } from "@/lib/api";

export type Periodo = "hoy" | "semana" | "mes" | "año";

export type VentaDTO = {
  id: string;
  total: number;
  tipo: "efectivo" | "fiado";
  created_at: string;
  items?: any[];
};

export type ClienteDTO = {
  id: string;
  nombre: string;
  celular?: string | null;
  deuda_total: number;
};

export type ProductoDTO = {
  id: string;
  nombre: string;
  codigo: string;
  stock: number;
};

export type DashboardSummary = {
  ventaHoy: number;
  gananciaHoy: number;
  deudaTotal: number;
  alertas: number;
  detallesVentas: VentaDTO[];
  detallesDeudas: ClienteDTO[];
  detallesAlertas: ProductoDTO[];
};

export async function getDashboardSummary(): Promise<DashboardSummary> {
  return api("/dashboard/summary", { method: "GET" });
}

/** Historial de ventas, agrupable por día o mes */
export async function getSalesHistory(params: {
  fromISO: string;
  toISO: string;
  groupBy: "day" | "month";
}): Promise<{ label: string; total: number; cobrado: number; fiado: number }[]> {
  const q = new URLSearchParams(params as any).toString();
  return api(`/dashboard/sales?${q}`, { method: "GET" });
}
