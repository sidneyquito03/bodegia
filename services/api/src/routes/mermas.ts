import { Router } from "express";
import db from "../db/index";
import { z } from "zod";

export const mermasRouter = Router();

// Schema de validación
const crearMermaSchema = z.object({
  producto_id: z.string().uuid(),
  tipo_merma: z.enum(["vencido", "defectuoso", "robo", "perdida", "daño", "obsoleto", "otro"]),
  cantidad: z.number().int().positive(),
  motivo: z.string().optional(),
  registrado_por: z.string().optional(),
});

/**
 * POST /mermas - Registrar una nueva merma y descontar del stock
 */
mermasRouter.post("/", async (req, res) => {
  try {
    const data = crearMermaSchema.parse(req.body);
    
    const resultado = await db.tx(async (t) => {
      // 1. Verificar que el producto existe y tiene stock suficiente
      const producto = await db.oneOrNone(
        `SELECT id, nombre, stock, precio_costo 
         FROM productos 
         WHERE id=$1`,
        [data.producto_id]
      );
      
      if (!producto) {
        throw new Error("Producto no encontrado");
      }
      
      if (producto.stock < data.cantidad) {
        throw new Error(
          `Stock insuficiente. Disponible: ${producto.stock}, Solicitado: ${data.cantidad}`
        );
      }
      
      // 2. Calcular costo total de la merma
      const costo_unitario = Number(producto.precio_costo);
      const costo_total = costo_unitario * data.cantidad;
      
      // 3. Registrar la merma
      const merma = await db.one(
        `INSERT INTO mermas(
          producto_id, tipo_merma, cantidad, costo_unitario, 
          costo_total, motivo, registrado_por
        ) VALUES($1, $2, $3, $4, $5, $6, $7)
        RETURNING id, producto_id, tipo_merma, cantidad, costo_unitario,
                  costo_total, motivo, registrado_por, fecha_registro, created_at`,
        [
          data.producto_id,
          data.tipo_merma,
          data.cantidad,
          costo_unitario,
          costo_total,
          data.motivo ?? null,
          data.registrado_por ?? "Sistema",
        ]
      );
      
      // 4. Descontar del stock (el trigger actualizará el estado automáticamente)
      await db.none(
        "UPDATE productos SET stock = stock - $1 WHERE id = $2",
        [data.cantidad, data.producto_id]
      );
      
      return merma;
    });
    
    res.status(201).json(resultado);
  } catch (error: any) {
    console.error("Error registrando merma:", error);
    res.status(400).json({ message: error.message || "Error al registrar merma" });
  }
});

/**
 * GET /mermas - Listar mermas con filtros
 */
mermasRouter.get("/", async (req, res) => {
  try {
    const { producto_id, tipo_merma, desde, hasta, limit = 100 } = req.query;
    
    let query = `
      SELECT 
        m.id, m.producto_id, m.tipo_merma, m.cantidad,
        m.costo_unitario::numeric::text as costo_unitario,
        m.costo_total::numeric::text as costo_total,
        m.motivo, m.registrado_por, m.fecha_registro, m.created_at,
        p.nombre as producto_nombre,
        p.codigo as producto_codigo,
        p.categoria as producto_categoria
      FROM mermas m
      LEFT JOIN productos p ON m.producto_id = p.id
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (producto_id) {
      conditions.push(`m.producto_id = $${params.length + 1}`);
      params.push(producto_id);
    }
    
    if (tipo_merma) {
      conditions.push(`m.tipo_merma = $${params.length + 1}`);
      params.push(tipo_merma);
    }
    
    if (desde) {
      conditions.push(`m.fecha_registro >= $${params.length + 1}`);
      params.push(desde);
    }
    
    if (hasta) {
      conditions.push(`m.fecha_registro <= $${params.length + 1}`);
      params.push(hasta);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    
    query += ` ORDER BY m.fecha_registro DESC LIMIT $${params.length + 1}`;
    params.push(Number(limit));
    
    const mermas = await db.manyOrNone(query, params);
    
    const resultado = mermas.map((m) => ({
      ...m,
      costo_unitario: Number(m.costo_unitario),
      costo_total: Number(m.costo_total),
    }));
    
    res.json(resultado);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /mermas/estadisticas - Obtener estadísticas de mermas
 */
mermasRouter.get("/estadisticas", async (req, res) => {
  try {
    const { desde, hasta } = req.query;
    
    let query = `
      SELECT 
        m.tipo_merma,
        COUNT(*)::int as cantidad_registros,
        SUM(m.cantidad)::int as unidades_totales,
        SUM(m.costo_total)::numeric::text as perdida_total
      FROM mermas m
    `;
    
    const conditions: string[] = [];
    const params: any[] = [];
    
    if (desde) {
      conditions.push(`m.fecha_registro >= $${params.length + 1}`);
      params.push(desde);
    }
    
    if (hasta) {
      conditions.push(`m.fecha_registro <= $${params.length + 1}`);
      params.push(hasta);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    
    query += ` GROUP BY m.tipo_merma ORDER BY perdida_total DESC`;
    
    const estadisticas = await db.manyOrNone(query, params);
    
    const resultado = estadisticas.map((e) => ({
      ...e,
      perdida_total: Number(e.perdida_total),
    }));
    
    // Calcular total general
    const totalQuery = `
      SELECT 
        COUNT(*)::int as total_registros,
        SUM(m.cantidad)::int as total_unidades,
        SUM(m.costo_total)::numeric::text as total_perdida
      FROM mermas m
      ${conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : ""}
    `;
    
    const totales = await db.one(totalQuery, params);
    
    res.json({
      por_tipo: resultado,
      totales: {
        ...totales,
        total_perdida: Number(totales.total_perdida),
      },
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /mermas/:id - Obtener una merma específica
 */
mermasRouter.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const merma = await db.oneOrNone(
      `SELECT 
        m.id, m.producto_id, m.tipo_merma, m.cantidad,
        m.costo_unitario::numeric::text as costo_unitario,
        m.costo_total::numeric::text as costo_total,
        m.motivo, m.registrado_por, m.fecha_registro, m.created_at,
        p.nombre as producto_nombre,
        p.codigo as producto_codigo,
        p.categoria as producto_categoria
       FROM mermas m
       LEFT JOIN productos p ON m.producto_id = p.id
       WHERE m.id = $1`,
      [id]
    );
    
    if (!merma) {
      return res.status(404).json({ message: "Merma no encontrada" });
    }
    
    res.json({
      ...merma,
      costo_unitario: Number(merma.costo_unitario),
      costo_total: Number(merma.costo_total),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * DELETE /mermas/:id - Eliminar una merma (restaura el stock)
 */
mermasRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    await db.tx(async (t) => {
      // Obtener datos de la merma antes de eliminar
      const merma = await db.oneOrNone(
        "SELECT producto_id, cantidad FROM mermas WHERE id=$1",
        [id]
      );
      
      if (!merma) {
        throw new Error("Merma no encontrada");
      }
      
      // Restaurar el stock
      await db.none(
        "UPDATE productos SET stock = stock + $1 WHERE id = $2",
        [merma.cantidad, merma.producto_id]
      );
      
      // Eliminar la merma
      await db.none("DELETE FROM mermas WHERE id=$1", [id]);
    });
    
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});
