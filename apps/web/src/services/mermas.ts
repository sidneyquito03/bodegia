import { api } from "@/lib/api";

export type TipoMerma = "vencido" | "defectuoso" | "robo" | "perdida" | "daño" | "obsoleto" | "otro";

export interface Merma {
  id: string;
  producto_id: string;
  producto_nombre: string;
  producto_codigo: string;
  producto_categoria: string;
  tipo_merma: TipoMerma;
  cantidad: number;
  costo_unitario: number;
  costo_total: number;
  motivo: string | null;
  registrado_por: string;
  fecha_registro: string;
  created_at: string;
}

export interface CrearMermaDTO {
  producto_id: string;
  tipo_merma: TipoMerma;
  cantidad: number;
  motivo?: string;
  registrado_por?: string;
}

export interface EstadisticasMermas {
  por_tipo: Array<{
    tipo_merma: TipoMerma;
    cantidad_registros: number;
    unidades_totales: number;
    perdida_total: number;
  }>;
  totales: {
    total_registros: number;
    total_unidades: number;
    total_perdida: number;
  };
}

export async function listMermas(params?: {
  producto_id?: string;
  tipo_merma?: TipoMerma;
  desde?: string;
  hasta?: string;
  limit?: number;
}): Promise<Merma[]> {
  const query = new URLSearchParams(params as any).toString();
  return api<Merma[]>(`/mermas${query ? `?${query}` : ""}`);
}

export async function getMerma(id: string): Promise<Merma> {
  return api<Merma>(`/mermas/${id}`);
}

export async function createMerma(dto: CrearMermaDTO): Promise<Merma> {
  return api<Merma>("/mermas", {
    method: "POST",
    body: JSON.stringify(dto),
  });
}

export async function deleteMerma(id: string): Promise<void> {
  await api(`/mermas/${id}`, { method: "DELETE" });
}

export async function getEstadisticasMermas(params?: {
  desde?: string;
  hasta?: string;
}): Promise<EstadisticasMermas> {
  const query = new URLSearchParams(params as any).toString();
  return api<EstadisticasMermas>(`/mermas/estadisticas${query ? `?${query}` : ""}`);
}
