import { Router } from "express";
import db from "../db/index";
import { z } from "zod";

const r = Router();

// Schema de validación
const itemVentaSchema = z.object({
  producto_id: z.string().uuid(),
  cantidad: z.number().int().positive(),
  precio_unitario: z.number().positive(),
});

const ventaSchema = z.object({
  items: z.array(itemVentaSchema).min(1),
  metodo_pago: z.enum(["efectivo", "tarjeta", "yape", "plin", "transferencia"]).default("efectivo"),
  tipo: z.enum(["Cobrado", "Fiado"]).default("Cobrado"),
  cliente_id: z.string().uuid().optional().nullable(),
});

/**
 * POST /ventas - Crear venta y descontar stock automáticamente
 */
r.post("/", async (req, res) => {
  try {
    const data = ventaSchema.parse(req.body);
    
    // Validación: si es fiado, requiere cliente
    if (data.tipo === "Fiado" && !data.cliente_id) {
      return res.status(400).json({ message: "Las ventas fiadas requieren un cliente" });
    }
    
    // Iniciar transacción
    await db.tx(async (t) => {
      // 1. Validar stock disponible para todos los productos
      for (const item of data.items) {
        const producto = await t.oneOrNone(
          "SELECT id, nombre, stock FROM productos WHERE id=$1",
          [item.producto_id]
        );
        
        if (!producto) {
          throw new Error(`Producto ${item.producto_id} no encontrado`);
        }
        
        if (producto.stock < item.cantidad) {
          throw new Error(
            `Stock insuficiente de "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${item.cantidad}`
          );
        }
      }
      
      // 2. Crear la venta
      const total = data.items.reduce(
        (sum, item) => sum + item.precio_unitario * item.cantidad,
        0
      );
      
      const venta = await t.one(
        `INSERT INTO ventas(total, metodo_pago, tipo, fecha)
         VALUES($1, $2, $3, NOW())
         RETURNING id, fecha, total, metodo_pago, tipo`,
        [total, data.metodo_pago, data.tipo]
      );
      
      // 3. Insertar detalle de venta
      for (const item of data.items) {
        await t.none(
          `INSERT INTO ventas_detalle(venta_id, producto_id, cantidad, precio_unitario)
           VALUES($1, $2, $3, $4)`,
          [venta.id, item.producto_id, item.cantidad, item.precio_unitario]
        );
      }
      
      // 4. Descontar stock de productos (el trigger actualizará el estado automáticamente)
      for (const item of data.items) {
        await t.none(
          "UPDATE productos SET stock = stock - $1 WHERE id = $2",
          [item.cantidad, item.producto_id]
        );
      }
      
      // 5. Si es fiado, crear transacción pendiente
      if (data.tipo === "Fiado" && data.cliente_id) {
        await t.none(
          `INSERT INTO fiados_transacciones(cliente_id, tipo, monto, venta_id, estado)
           VALUES($1, 'fiado', $2, $3, 'pendiente')`,
          [data.cliente_id, total, venta.id]
        );
        
        // Actualizar deuda total del cliente
        await t.none(
          `UPDATE clientes SET deuda_total = deuda_total + $1 WHERE id = $2`,
          [total, data.cliente_id]
        );
      }
      
      // Retornar venta con detalles
      const ventaCompleta = await t.one(
        `SELECT 
          v.id, v.fecha, v.total, v.metodo_pago, v.tipo,
          json_agg(
            json_build_object(
              'producto_id', vd.producto_id,
              'producto_nombre', p.nombre,
              'cantidad', vd.cantidad,
              'precio_unitario', vd.precio_unitario
            )
          ) as items
         FROM ventas v
         LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
         LEFT JOIN productos p ON vd.producto_id = p.id
         WHERE v.id = $1
         GROUP BY v.id`,
        [venta.id]
      );
      
      return res.status(201).json(ventaCompleta);
    });
  } catch (error: any) {
    console.error("Error en venta:", error);
    res.status(400).json({ message: error.message || "Error al procesar la venta" });
  }
});

/**
 * GET /ventas - Listar ventas
 */
r.get("/", async (req, res) => {
  try {
    const { desde, hasta, tipo } = req.query;
    
    let query = `
      SELECT 
        v.id, v.fecha, v.total, v.metodo_pago, v.tipo,
        json_agg(
          json_build_object(
            'producto_id', vd.producto_id,
            'producto_nombre', p.nombre,
            'cantidad', vd.cantidad,
            'precio_unitario', vd.precio_unitario
          )
        ) as items
      FROM ventas v
      LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
      LEFT JOIN productos p ON vd.producto_id = p.id
    `;
    
    const conditions = [];
    const params: any[] = [];
    
    if (desde) {
      conditions.push(`v.fecha >= $${params.length + 1}`);
      params.push(desde);
    }
    
    if (hasta) {
      conditions.push(`v.fecha <= $${params.length + 1}`);
      params.push(hasta);
    }
    
    if (tipo) {
      conditions.push(`v.tipo = $${params.length + 1}`);
      params.push(tipo);
    }
    
    if (conditions.length > 0) {
      query += ` WHERE ${conditions.join(" AND ")}`;
    }
    
    query += ` GROUP BY v.id ORDER BY v.fecha DESC`;
    
    const ventas = await db.manyOrNone(query, params);
    res.json(ventas);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

/**
 * GET /ventas/:id - Obtener venta por ID
 */
r.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    
    const venta = await db.oneOrNone(
      `SELECT 
        v.id, v.fecha, v.total, v.metodo_pago, v.tipo,
        json_agg(
          json_build_object(
            'producto_id', vd.producto_id,
            'producto_nombre', p.nombre,
            'cantidad', vd.cantidad,
            'precio_unitario', vd.precio_unitario
          )
        ) as items
       FROM ventas v
       LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
       LEFT JOIN productos p ON vd.producto_id = p.id
       WHERE v.id = $1
       GROUP BY v.id`,
      [id]
    );
    
    if (!venta) {
      return res.status(404).json({ message: "Venta no encontrada" });
    }
    
    res.json(venta);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default r;
