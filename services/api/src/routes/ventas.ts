import { Router } from "express";
import { randomUUID } from "crypto";

/** TIPOS (ajusta cuando conectes Postgres) */
type Producto = {
  id: string;
  nombre: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
};
type Cliente = {
  id: string;
  nombre: string;
  deuda_total: number;
};
type ItemVenta = { producto_id: string; nombre: string; cantidad: number; precio: number };
type Venta = {
  id: string;
  subtotal: number;
  total: number;
  tipo: "efectivo" | "fiado";
  cliente_id?: string | null;
  items: ItemVenta[];
  created_at: string;
};
type TransaccionFiado = {
  id: string;
  cliente_id: string;
  tipo: "fiado" | "pago";
  monto: number;
  descripcion?: string | null;
  estado: "pendiente" | "completado";
  metodo_pago?: string | null;
  referencia_transaccion?: string | null;
  created_at: string;
};

/** STORES en memoria (reemplaza con DB) */
const productos = new Map<string, Producto>(); // llena con mock si quieres
const clientes = new Map<string, Cliente>();
const ventas: Venta[] = [];
const transaccionesFiados: TransaccionFiado[] = [];

const r = Router();

/** POST /ventas: crea venta, descuenta stock y si es fiado, suma deuda + transacción */
r.post("/", (req, res) => {
  const { items, tipo, cliente_id } = req.body as {
    items: ItemVenta[];
    tipo: "efectivo" | "fiado";
    cliente_id?: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items requeridos" });
  }
  if (tipo === "fiado" && !cliente_id) {
    return res.status(400).json({ message: "Cliente requerido para fiado" });
  }

  // valida stock
  for (const it of items) {
    const p = productos.get(it.producto_id);
    if (!p) return res.status(404).json({ message: `Producto ${it.producto_id} no existe` });
    if (p.stock < it.cantidad) {
      return res.status(409).json({ message: `Stock insuficiente de ${p.nombre}` });
    }
  }

  // descuenta stock
  for (const it of items) {
    const p = productos.get(it.producto_id)!;
    p.stock -= it.cantidad;
    productos.set(p.id, p);
  }

  const subtotal = items.reduce((s, it) => s + it.precio * it.cantidad, 0);
  const total = subtotal; // aplica descuentos/impuestos si luego hace falta

  const venta: Venta = {
    id: randomUUID(),
    subtotal,
    total,
    tipo,
    cliente_id: cliente_id ?? null,
    items,
    created_at: new Date().toISOString(),
  };
  ventas.push(venta);

  if (tipo === "fiado" && cliente_id) {
    const c = clientes.get(cliente_id);
    if (!c) return res.status(404).json({ message: "Cliente no encontrado" });
    c.deuda_total += total;
    clientes.set(c.id, c);

    transaccionesFiados.push({
      id: randomUUID(),
      cliente_id,
      tipo: "fiado",
      monto: total,
      descripcion: "Venta fiada",
      estado: "pendiente",
      created_at: new Date().toISOString(),
    });
  }

  res.status(201).json(venta);
});

export default r;
