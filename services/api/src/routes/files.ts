import { Router } from "express";
import multer from "multer";
import path from "path";
import fs from "fs";

const router = Router();
const uploadDir = path.join(process.cwd(), "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const upload = multer({ dest: uploadDir });

router.post("/upload", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file" });
  const url = `/uploads/${req.file.filename}`; // estático en index.ts
  res.status(201).json({ url });
});

export default router;

/*const UPLOAD_DIR = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination(_req, _file, cb) { cb(null, UPLOAD_DIR); },
  filename(_req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    const name = `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`;
    cb(null, name);
  },
});

function fileFilter(_req: any, file: Express.Multer.File, cb: multer.FileFilterCallback) {
  const ok = /image\/(png|jpe?g|webp|gif)/.test(file.mimetype);

  if (ok) {
    (cb as any)(null, true); 
  } else {
    (cb as any)(new Error("Formato no permitido"), false); 
  }
}
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, 
});

r.post("/", upload.single("file"), (req, res) => {
  if (!req.file) return res.status(400).json({ message: "Archivo requerido" });
  // expone estático en /uploads
  const publicBase = process.env.PUBLIC_BASE_URL ?? "";
  const url = `${publicBase}/uploads/${req.file.filename}`;
  res.json({ url });
});

export default r;*/