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

// --- DATOS FALSOS DE GRÁFICA ---
const DATOS_GRAFICA_INICIALES = {
  hoy: [
    { label: "00:00", total: 120, cobrado: 100, fiado: 20 },
    { label: "02:00", total: 180, cobrado: 150, fiado: 30 },
    { label: "04:00", total: 95, cobrado: 80, fiado: 15 },
    { label: "06:00", total: 350, cobrado: 280, fiado: 70 },
    { label: "08:00", total: 680, cobrado: 550, fiado: 130 },
    { label: "10:00", total: 920, cobrado: 750, fiado: 170 },
    { label: "12:00", total: 1250, cobrado: 1000, fiado: 250 },
    { label: "14:00", total: 980, cobrado: 800, fiado: 180 },
    { label: "16:00", total: 1100, cobrado: 900, fiado: 200 },
    { label: "18:00", total: 850, cobrado: 700, fiado: 150 },
    { label: "20:00", total: 620, cobrado: 500, fiado: 120 },
    { label: "22:00", total: 280, cobrado: 230, fiado: 50 },
  ],
  semana: [
    { label: "Lunes", total: 2850, cobrado: 2200, fiado: 650 },
    { label: "Martes", total: 3120, cobrado: 2450, fiado: 670 },
    { label: "Miércoles", total: 3450, cobrado: 2800, fiado: 650 },
    { label: "Jueves", total: 3890, cobrado: 3150, fiado: 740 },
    { label: "Viernes", total: 4200, cobrado: 3500, fiado: 700 },
    { label: "Sábado", total: 4650, cobrado: 3900, fiado: 750 },
    { label: "Domingo", total: 3200, cobrado: 2700, fiado: 500 },
  ],
  mes: [
    { label: "Sem 1", total: 21505, cobrado: 17600, fiado: 3905 },
    { label: "Sem 2", total: 23450, cobrado: 19200, fiado: 4250 },
    { label: "Sem 3", total: 25300, cobrado: 20800, fiado: 4500 },
    { label: "Sem 4", total: 24680, cobrado: 20300, fiado: 4380 },
  ],
  año: [
    { label: "Enero", total: 86020, cobrado: 70400, fiado: 15620 },
    { label: "Febrero", total: 82150, cobrado: 67200, fiado: 14950 },
    { label: "Marzo", total: 91200, cobrado: 74600, fiado: 16600 },
    { label: "Abril", total: 88900, cobrado: 72800, fiado: 16100 },
    { label: "Mayo", total: 95300, cobrado: 78200, fiado: 17100 },
    { label: "Junio", total: 98500, cobrado: 80800, fiado: 17700 },
    { label: "Julio", total: 102300, cobrado: 83900, fiado: 18400 },
    { label: "Agosto", total: 99800, cobrado: 81900, fiado: 17900 },
    { label: "Septiembre", total: 96400, cobrado: 79200, fiado: 17200 },
    { label: "Octubre", total: 103200, cobrado: 84600, fiado: 18600 },
    { label: "Noviembre", total: 105600, cobrado: 86600, fiado: 19000 },
    { label: "Diciembre", total: 108900, cobrado: 89300, fiado: 19600 },
  ],
};

const Dashboard = () => {
  const navigate = useNavigate();

  const [kpis, setKpis] = useState<DashboardSummary>({
    ventaHoy: 8725,
    gananciaHoy: 2182.50,
    deudaTotal: 3450.75,
    alertas: 3,
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
  const [series, setSeries] = useState<{ label: string; total: number; cobrado: number; fiado: number }[]>(DATOS_GRAFICA_INICIALES.hoy);

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

  // Actualizar datos cuando cambia el período
  useEffect(() => {
    setSeries(DATOS_GRAFICA_INICIALES[periodo]);
  }, [periodo]);

  useEffect(() => {
    (async () => {
      try {
        console.log("[Dashboard] Calling getDashboardSummary...");
        const data = await getDashboardSummary();
        console.log("[Dashboard] Data received:", data);
        setKpis(data);
      } catch (e) {
        console.error("[Dashboard] getDashboardSummary error:", e);
      }
    })();
  }, []);

  const chartData = useMemo(
    () => ({
      labels: series.map((s) => s.label),
      datasets: [
        {
          label: "Ventas",
          data: series.map((s) => s.total),
          borderColor: "rgb(33, 128, 141)",
          backgroundColor: "rgba(33, 128, 141, 0.1)",
          fill: true,
          tension: 0.4,
          pointRadius: 5,
          pointBackgroundColor: "rgb(33, 128, 141)",
          pointBorderColor: "white",
          pointBorderWidth: 2,
          pointHoverRadius: 7,
        },
        {
          label: "Cobrado",
          data: series.map((s) => s.cobrado),
          borderColor: "rgb(34, 197, 94)",
          backgroundColor: "rgba(34, 197, 94, 0.05)",
          fill: true,
          tension: 0.4,
          borderDash: [6, 6],
          pointRadius: 4,
          pointBackgroundColor: "rgb(34, 197, 94)",
          pointBorderColor: "white",
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
        {
          label: "Fiado",
          data: series.map((s) => s.fiado),
          borderColor: "rgb(239, 68, 68)",
          backgroundColor: "rgba(239, 68, 68, 0.05)",
          fill: true,
          tension: 0.4,
          pointRadius: 4,
          pointBackgroundColor: "rgb(239, 68, 68)",
          pointBorderColor: "white",
          pointBorderWidth: 2,
          pointHoverRadius: 6,
        },
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

        <Card className="p-4 sm:p-6 border border-border/50">
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
            <div>
              <h3 className="text-lg sm:text-xl font-semibold">Historial de Ventas</h3>
              <p className="text-xs text-muted-foreground mt-1">Análisis de ventas totales, cobrados y fiados</p>
            </div>
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

          <Card className="p-4 sm:p-6 border border-border/50">
            <div className="h-80 w-full">
              <Line
                data={chartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: "top" as const,
                      labels: {
                        usePointStyle: true,
                        padding: 20,
                        font: {
                          size: 12,
                          weight: "500",
                        },
                        boxPadding: 8,
                      },
                    },
                    tooltip: {
                      backgroundColor: "rgba(0, 0, 0, 0.8)",
                      padding: 12,
                      cornerRadius: 8,
                      titleFont: {
                        size: 13,
                        weight: "600",
                      },
                      bodyFont: {
                        size: 12,
                      },
                      callbacks: {
                        label: function (context) {
                          let label = context.dataset.label || "";
                          if (label) {
                            label += ": ";
                          }
                          if (context.parsed.y !== null) {
                            label += "S/. " + context.parsed.y.toFixed(2);
                          }
                          return label;
                        },
                      },
                    },
                  },
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: periodo === "año" ? "Meses" : periodo === "mes" ? "Semanas" : "Tiempo",
                        font: {
                          size: 12,
                          weight: "600",
                        },
                      },
                      grid: {
                        drawBorder: false,
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                    y: {
                      title: {
                        display: true,
                        text: "Ventas (S/.)",
                        font: {
                          size: 12,
                          weight: "600",
                        },
                      },
                      beginAtZero: true,
                      grid: {
                        color: "rgba(0, 0, 0, 0.05)",
                      },
                    },
                  },
                }}
              />
            </div>

            {/* Estadísticas debajo del gráfico */}
            <div className="mt-6 pt-6 border-t grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Ventas</p>
                <p className="text-lg font-bold text-primary">
                  S/. {series.reduce((sum, s) => sum + s.total, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Cobrado</p>
                <p className="text-lg font-bold text-green-600">
                  S/. {series.reduce((sum, s) => sum + s.cobrado, 0).toFixed(2)}
                </p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Total Fiado</p>
                <p className="text-lg font-bold text-red-600">
                  S/. {series.reduce((sum, s) => sum + s.fiado, 0).toFixed(2)}
                </p>
              </div>
            </div>
          </Card>
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
