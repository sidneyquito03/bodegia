import { api } from "@/lib/api";

export type PeriodoSUNAT = "mes-actual" | "mes-anterior" | "trimestre" | "anual";

export type SunatSummary = {
  totalVentas: number;
  totalVentasCobradas: number;
  totalCompras: number;  
  totalFiados: number;
  totalPagos: number;
  periodo: string;
  desde: string;
  hasta: string;
};

export async function getSunatSummary(params: {
  periodo: PeriodoSUNAT;
}): Promise<SunatSummary> {
  const q = new URLSearchParams({ periodo: params.periodo });
  return api(`/reports/sunat/summary?${q.toString()}`, { method: "GET" });
}

export async function getSunatVentasDetalle(params: {
  periodo: PeriodoSUNAT;
}): Promise<any[]> {
  const q = new URLSearchParams({ periodo: params.periodo });
  return api(`/reports/sunat/ventas-detalle?${q.toString()}`, { method: "GET" });
}

export async function getSunatFiadosDetalle(params: {
  periodo: PeriodoSUNAT;
}): Promise<any[]> {
  const q = new URLSearchParams({ periodo: params.periodo });
  return api(`/reports/sunat/fiados-detalle?${q.toString()}`, { method: "GET" });
}

export async function getSunatComprasDetalle(params: {
  periodo: PeriodoSUNAT;
}): Promise<any[]> {
  const q = new URLSearchParams({ periodo: params.periodo });
  return api(`/reports/sunat/compras-detalle?${q.toString()}`, { method: "GET" });
}
