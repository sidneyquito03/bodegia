import { Router } from "express";
import db from "../db/index";
import bcrypt from "bcryptjs";
import { signToken, requireAuth } from "../middleware/auth";

const r = Router();

// POST /auth/login
r.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) return res.status(400).json({ message: "email y password requeridos" });

    const user = await db.oneOrNone("SELECT id, email, password_hash, nombre, role, activo FROM usuarios WHERE email=$1", [email]);
    if (!user) return res.status(401).json({ message: "Credenciales inválidas" });
    if (!user.activo) return res.status(403).json({ message: "Usuario inactivo" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ message: "Credenciales inválidas" });

    const token = signToken({ id: user.id, email: user.email, role: user.role });
    res.json({ token, user: { id: user.id, email: user.email, nombre: user.nombre, role: user.role } });
  } catch (err: any) {
    console.error("/auth/login error", err);
    res.status(500).json({ message: "error" });
  }
});

// GET /auth/me
r.get("/me", requireAuth, async (req, res) => {
  const user = (req as any).user;
  // Return minimal info
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
});

export default r;
