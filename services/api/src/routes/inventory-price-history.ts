import { Router } from "express";
const r = Router();

type HistItem = {
  id: string;
  producto_id: string;
  precio_costo_anterior: number;
  precio_venta_anterior: number;
  precio_costo_nuevo: number;
  precio_venta_nuevo: number;
  motivo?: string | null;
  created_at: string;
};

const hist: HistItem[] = []; 

r.get("/:productoId/price-history", (req, res) => {
  const { productoId } = req.params;
  const items = hist
    .filter(h => h.producto_id === productoId)
    .sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
  res.json(items);
});

export default r;
