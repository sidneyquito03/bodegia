import { api } from "@/lib/api";

export type AIMessage = { role: "user" | "assistant"; content: string };

export const chat = (messages: AIMessage[]) =>
  api<{ message: string }>("/ai/chat", {
    method: "POST",
    body: JSON.stringify({ messages }),
  },);

export type Recomendacion = {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: "Alta" | "Media" | "Baja";
  categoria: string; // Ventas|Inventario|Fiados|Operaciones
};
export async function generateStrategicRecommendations(payload: {
  ventas: number;
  totalVendido: number;
  clientesConDeuda: number;
  deudaTotal: number;
  productosStockBajo: number;
  transaccionesFiados: number;
  metodosPago: Record<string, number>;
}) {
  return api<Recomendacion[]>("/ai/strategist", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}
