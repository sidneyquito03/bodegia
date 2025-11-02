import { Router } from "express";
import { randomUUID } from "crypto";

type Operador = {
  id: string;
  nombre: string;
  celular: string;
  activo: boolean;
  email?: string | null;
  dni?: string | null;
  direccion?: string | null;
};

// TEMP: en memoria hasta conectar Postgres
const store: Operador[] = [];

const r = Router();

r.get("/", (_req, res) => {
  res.json(store);
});

r.post("/", (req, res) => {
  const body = req.body as Omit<Operador, "id"> & Partial<Pick<Operador, "id">>;
  const nuevo: Operador = {
    id: body.id ?? randomUUID(),
    nombre: body.nombre?.trim() ?? "",
    celular: body.celular?.trim() ?? "",
    activo: body.activo ?? true,
    email: body.email ?? null,
    dni: body.dni ?? null,
    direccion: body.direccion ?? null,
  };
  store.push(nuevo);
  res.status(201).json(nuevo);
});

r.put("/:id", (req, res) => {
  const { id } = req.params;
  const i = store.findIndex((o) => o.id === id);
  if (i === -1) return res.status(404).json({ message: "Operador no encontrado" });
  store[i] = { ...store[i], ...req.body };
  res.json(store[i]);
});

r.put("/:id/toggle", (req, res) => {
  const { id } = req.params;
  const i = store.findIndex((o) => o.id === id);
  if (i === -1) return res.status(404).json({ message: "Operador no encontrado" });
  const nextActivo = typeof req.body?.activo === "boolean" ? req.body.activo : !store[i].activo;
  store[i] = { ...store[i], activo: nextActivo };
  res.json(store[i]);
});

r.delete("/:id", (req, res) => {
  const { id } = req.params;
  const i = store.findIndex((o) => o.id === id);
  if (i === -1) return res.status(404).json({ message: "Operador no encontrado" });
  store.splice(i, 1);
  res.status(204).end();
});

export default r;
