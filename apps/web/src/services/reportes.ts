import { api } from "@/lib/api";

export type PeriodoSUNAT = "mes-actual" | "mes-anterior" | "trimestre" | "anual";

export type SunatSummary = {
  totalVentas: number;
  totalCompras: number;  
  totalFiados: number;
  totalPagos: number;
};

export async function getSunatSummary(params: {
  periodo: PeriodoSUNAT;
}): Promise<SunatSummary> {
  const q = new URLSearchParams({ periodo: params.periodo });
  return api(`/reports/sunat/summary?${q.toString()}`, { method: "GET" });
}
