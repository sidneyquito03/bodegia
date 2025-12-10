import { Router } from "express";
import db from "../db/index";
import bcrypt from "bcryptjs";
import { requireAuth, requireRole } from "../middleware/auth";
import { z } from "zod";

const r = Router();

const crearUsuarioSchema = z.object({
  email: z.string().email(),
  nombre: z.string().min(1),
  password: z.string().min(6),
  role: z.enum(["admin", "vendedor"]).default("vendedor"),
});

const editarUsuarioSchema = z.object({
  nombre: z.string().min(1).optional(),
  activo: z.boolean().optional(),
});

// GET /usuarios - Listar usuarios (solo admin)
r.get("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const usuarios = await db.manyOrNone(
      "SELECT id, email, nombre, role, activo, created_at FROM usuarios ORDER BY created_at DESC"
    );
    res.json(usuarios);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// POST /usuarios - Crear usuario (solo admin)
r.post("/", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    console.log('[POST /usuarios] Body recibido:', req.body);
    console.log('[POST /usuarios] Usuario autenticado:', (req as any).user);
    const data = crearUsuarioSchema.parse(req.body);
    console.log('[POST /usuarios] Data validada:', data);

    // Verificar que email no existe
    const existe = await db.oneOrNone("SELECT id FROM usuarios WHERE email=$1", [data.email]);
    if (existe) {
      return res.status(409).json({ message: "El email ya está registrado" });
    }

    // Hash contraseña
    const hash = await bcrypt.hash(data.password, 10);

    // Crear usuario
    const usuario = await db.one(
      `INSERT INTO usuarios(email, password_hash, nombre, role, activo)
       VALUES($1, $2, $3, $4, true)
       RETURNING id, email, nombre, role, activo, created_at`,
      [data.email, hash, data.nombre, data.role]
    );

    res.status(201).json(usuario);
  } catch (error: any) {
    if (error.code === "23505") {
      return res.status(409).json({ message: "El email ya existe" });
    }
    res.status(400).json({ message: error.message });
  }
});

// PATCH /usuarios/:id - Editar usuario (solo admin)
r.patch("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;
    const data = editarUsuarioSchema.parse(req.body);

    const campos = [];
    const valores = [];
    let idx = 1;

    if (data.nombre !== undefined) {
      campos.push(`nombre=$${idx}`);
      valores.push(data.nombre);
      idx++;
    }

    if (data.activo !== undefined) {
      campos.push(`activo=$${idx}`);
      valores.push(data.activo);
      idx++;
    }

    if (campos.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }

    campos.push(`updated_at=NOW()`);
    valores.push(id);

    const usuario = await db.one(
      `UPDATE usuarios SET ${campos.join(", ")} WHERE id=$${idx} RETURNING id, email, nombre, role, activo, created_at`,
      valores
    );

    res.json(usuario);
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /usuarios/:id - Eliminar usuario (solo admin)
r.delete("/:id", requireAuth, requireRole("admin"), async (req, res) => {
  try {
    const { id } = req.params;

    // Evitar que se borre a sí mismo
    const currentUser = (req as any).user;
    if (currentUser.id === id) {
      return res.status(400).json({ message: "No puedes eliminarte a ti mismo" });
    }

    await db.none("DELETE FROM usuarios WHERE id=$1", [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

export default r;
