import db from "../db/index";
import bcrypt from "bcryptjs";

async function run() {
  const email = process.env.SEED_ADMIN_EMAIL ?? "admin@local"
  const pass = process.env.SEED_ADMIN_PASSWORD ?? "admin123"
  const nombre = process.env.SEED_ADMIN_NAME ?? "Admin";

  const hash = await bcrypt.hash(pass, 10);

  const exists = await db.oneOrNone("SELECT id FROM usuarios WHERE email=$1", [email]);
  if (exists) {
    console.log("Admin ya existe, saltando");
    process.exit(0);
  }

  await db.none(
    `INSERT INTO usuarios(email, password_hash, nombre, role, activo, created_at)
     VALUES($1, $2, $3, 'admin', true, NOW())`,
    [email, hash, nombre]
  );

  console.log(`Admin creado: ${email}`);
  process.exit(0);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});
