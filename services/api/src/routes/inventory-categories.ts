import { Router } from "express";
const r = Router();

const categorias = new Set<string>(["general", "bebidas", "snacks"]);

r.get("/categories", (_req, res) => {
  res.json(Array.from(categorias).sort());
});

export default r;
