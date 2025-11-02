import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { ConsejeroEstrategico } from "@/components/ConsejeroEstrategico";
import { DollarSign, TrendingUp, AlertCircle, CreditCard, Package, ShoppingCart } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Line } from "react-chartjs-2";
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

import { getDashboardSummary, getSalesHistory, type DashboardSummary } from "@/services/dashboard";

type Periodo = "hoy" | "semana" | "mes" | "año";

const Dashboard = () => {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<DashboardSummary>({
    ventaHoy: 0,
    gananciaHoy: 0,
    deudaTotal: 0,
    alertas: 0,
    detallesVentas: [],
    detallesDeudas: [],
    detallesAlertas: [],
  });

  const [detallesModal, setDetallesModal] = useState<{
    open: boolean;
    type: "ventas" | "deudas" | "alertas" | null;
    title: string;
  }>({ open: false, type: null, title: "" });

  const [periodo, setPeriodo] = useState<Periodo>("hoy");
  const [series, setSeries] = useState<{ label: string; total: number; cobrado: number; fiado: number }[]>([]);

  // Rango por periodo
  const rango = useMemo(() => {
    const now = new Date();
    const toISO = now.toISOString();
    const from = new Date(now);
    if (periodo === "hoy") from.setHours(0, 0, 0, 0);
    if (periodo === "semana") from.setDate(from.getDate() - 7);
    if (periodo === "mes") from.setMonth(from.getMonth() - 1);
    if (periodo === "año") from.setFullYear(from.getFullYear() - 1);
    return { fromISO: from.toISOString(), toISO, groupBy: periodo === "año" ? "month" : "day" as const };
  }, [periodo]);

  useEffect(() => {
    (async () => {
      try {
        const data = await getDashboardSummary();
        setKpis(data);
      } catch (e) {
        console.error("getDashboardSummary:", e);
      }
    })();
  }, []);

useEffect(() => {
    (async () => {
      try {
        const data = await getSalesHistory(rango as { fromISO: string; toISO: string; groupBy: "month" | "day"; }); 
        setSeries(data);
      } catch (e) {
        console.error("getSalesHistory:", e);
        setSeries([]);
      }
    })();
  }, [rango]);

  const chartData = useMemo(
    () => ({
      labels: series.map((s) => s.label),
      datasets: [
        { label: "Ventas", data: series.map((s) => s.total), borderColor: "rgb(75, 192, 192)", fill: false },
        { label: "Cobrado", data: series.map((s) => s.cobrado), borderColor: "rgb(75, 192, 192)", borderDash: [6, 6], fill: false },
        { label: "Fiado", data: series.map((s) => s.fiado), borderColor: "rgb(255, 99, 132)", fill: false },
      ],
    }),
    [series]
  );

  const abrirDetalles = (type: "ventas" | "deudas" | "alertas") => {
    const title =
      type === "ventas" ? "Detalle de Ventas Hoy" :
      type === "deudas" ? "Detalle de Deudas" :
      "Productos con Stock Bajo";
    setDetallesModal({ open: true, type, title });
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Resumen de tu bodega en tiempo real</p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div onClick={() => abrirDetalles("ventas")} className="cursor-pointer">
            <KPICard title="Venta Hoy" value={`S/. ${kpis.ventaHoy.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />} trend={{ value: "+12.5%", isPositive: true }} comparisonText="vs. el día anterior" />
          </div>
          <KPICard title="Ganancia Hoy" value={`S/. ${kpis.gananciaHoy.toFixed(2)}`} icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />} trend={{ value: "+8.3%", isPositive: true }} comparisonText="vs. el día anterior" />
          <div onClick={() => abrirDetalles("deudas")} className="cursor-pointer">
            <KPICard title="Deuda Total" value={`S/. ${kpis.deudaTotal.toFixed(2)}`} icon={<CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />} />
          </div>
          <div onClick={() => abrirDetalles("alertas")} className="cursor-pointer">
            <KPICard title="Alertas" value={kpis.alertas} icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />} />
          </div>
        </div>

        <ConsejeroEstrategico />

        <Card className="p-4 sm:p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button onClick={() => navigate("/pos")} className="h-auto py-4 flex-col gap-2">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Nueva Venta</span>
            </Button>
            <Button onClick={() => navigate("/inventario")} variant="outline" className="h-auto py-4 flex-col gap-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Agregar Producto</span>
            </Button>
            <Button onClick={() => navigate("/fiados")} variant="outline" className="h-auto py-4 flex-col gap-2">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Registrar Pago</span>
            </Button>
          </div>
        </Card>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg sm:text-xl font-semibold">Historial de Ventas</h3>
            <Select value={periodo} onValueChange={(v: Periodo) => setPeriodo(v)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="hoy">Hoy</SelectItem>
                <SelectItem value="semana">Última Semana</SelectItem>
                <SelectItem value="mes">Último Mes</SelectItem>
                <SelectItem value="año">Último Año</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            <Card className="p-4 sm:p-6 shadow-card">
              <div className="space-y-3">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    scales: {
                      x: { title: { display: true, text: rango.groupBy === "month" ? "Mes" : "Fecha" } },
                      y: { title: { display: true, text: "Ventas (S/.)" } },
                    },
                  }}
                />
              </div>
            </Card>
          </div>
        </div>

        <Dialog open={detallesModal.open} onOpenChange={(open) => setDetallesModal({ ...detallesModal, open })}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detallesModal.title}</DialogTitle>
            </DialogHeader>

            <div className="space-y-3">
              {detallesModal.type === "ventas" &&
                kpis.detallesVentas.map((venta, i) => (
                  <div key={venta.id} className="p-4 mb-3 border rounded-lg shadow-sm hover:shadow-md bg-white transition-all">
                    <div className="flex justify-between">
                      <span className="font-medium text-lg">Venta #{i + 1}</span>
                      <span className="font-bold text-primary text-xl">S/. {Number(venta.total).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mt-2">Fecha: {new Date(venta.created_at).toLocaleString("es-PE")}</p>
                    <p className="text-xs text-muted-foreground mt-1">Tipo de pago: {venta.tipo}</p>
                  </div>
                ))}

              {detallesModal.type === "deudas" &&
                kpis.detallesDeudas.map((cliente) => (
                  <div key={cliente.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between">
                      <span className="font-medium">{cliente.nombre}</span>
                      <span className="font-bold text-destructive">S/. {Number(cliente.deuda_total).toFixed(2)}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{cliente.celular}</p>
                  </div>
                ))}

              {detallesModal.type === "alertas" &&
                kpis.detallesAlertas.map((producto) => (
                  <div key={producto.id} className="p-3 border rounded-lg">
                    <div className="flex justify-between items-center">
                      <div>
                        <span className="font-medium block">{producto.nombre}</span>
                        <span className="text-sm text-muted-foreground">{producto.codigo}</span>
                      </div>
                      <div className="text-right">
                        <span className={`font-bold ${producto.stock < 5 ? "text-destructive" : "text-orange-600"}`}>
                          {producto.stock} unidades
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <ChatbotWidget />
    </Layout>
  );
};

export default Dashboard;
