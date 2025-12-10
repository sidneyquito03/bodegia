import express from "express";
import cors from "cors";
import path from "path";

// Imports de rutas
import aiRouter from "./routes/ai";
import aiStrategist from "./routes/ai-strategist";
import fiadosRouter from "./routes/fiados";
import fiadosTxRouter from "./routes/fiados-transacciones";
import filesRouter from "./routes/files";
import inventoryPriceHistory from "./routes/inventory-price-history";
import inventoryCatRouter from "./routes/inventory-categories";
import operatorsRouter from "./routes/operators";
import authRouter from "./routes/auth";
import usuariosRouter from "./routes/usuarios";
import ventasRouter from "./routes/ventas";
import dashboardRouter from "./routes/dashboard";
import reportsSunatRouter from "./routes/reports.sunat"; // <--- Tu archivo
import { inventoryRouter } from "./routes/inventory";
import { inventoryImportRouter } from "./routes/inventory-import";
import { providersRouter } from "./routes/providers";
import { comprasProvRouter } from "./routes/compras_proveedores";
import { metricsRouter } from "./routes/metrics";
import { mermasRouter } from "./routes/mermas";

const app = express();

app.use(cors());
app.use(express.json());

// Configuración de rutas
app.use("/ai", aiRouter);
app.use("/ai/strategist", aiStrategist);
app.use("/auth", authRouter);
app.use("/usuarios", usuariosRouter);
app.use("/fiados", fiadosRouter);
app.use("/fiados/transacciones", fiadosTxRouter);
app.use("/inventory", inventoryCatRouter);
app.use("/inventory", inventoryRouter);
app.use("/inventory", inventoryImportRouter);
app.use("/proveedores", providersRouter);
app.use("/compras-proveedores", comprasProvRouter);
app.use("/metrics", metricsRouter);
app.use("/mermas", mermasRouter);
app.use("/operators", operatorsRouter);
app.use("/ventas", ventasRouter);

// === AQUÍ LA CONEXIÓN CORRECTA ===
// El frontend pide: /reports/sunat/summary
// Aquí definimos la base: /reports/sunat
app.use("/reports/sunat", reportsSunatRouter); 

const uploadsDir = process.env.UPLOAD_DIR ?? path.join(process.cwd(), "uploads");
app.use("/uploads", express.static(uploadsDir));
app.use("/dashboard", dashboardRouter);
app.use("/files", filesRouter);
app.use("/inventory", inventoryPriceHistory);

const port = process.env.PORT ?? "3000";
app.listen(Number(port), () => {
  console.log(`API listening on http://localhost:${port}`);
});