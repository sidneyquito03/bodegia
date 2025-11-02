import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Download, FileText, Calendar } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { getSunatSummary, type PeriodoSUNAT } from "@/services/reportes";

const ReportesSUNAT = () => {
  const [periodo, setPeriodo] = useState<PeriodoSUNAT>("mes-actual");
  const [datos, setDatos] = useState({ totalVentas: 0, totalCompras: 0, totalFiados: 0, totalPagos: 0 });
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const res = await getSunatSummary({ periodo });
        setDatos(res);
      } catch (error) {
        console.error("Error cargando datos:", error);
        toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
      } finally {
        setLoading(false);
      }
    })();
  }, [periodo, toast]);

  const tituloPeriodo = useMemo(() => {
    switch (periodo) {
      case "mes-actual": return "Mes Actual";
      case "mes-anterior": return "Mes Anterior";
      case "trimestre": return "Trimestre Actual";
      case "anual": return "Año Actual";
    }
  }, [periodo]);

  const descargarReporte = () => {
    const csv = `
REPORTE PARA SUNAT - RÉGIMEN ÚNICO SIMPLIFICADO (RUS)
Período: ${tituloPeriodo}
Fecha de generación: ${new Date().toLocaleDateString('es-PE')}

RESUMEN FINANCIERO:
Total de Ventas:,S/. ${datos.totalVentas.toFixed(2)}
Total de Compras:,S/. ${datos.totalCompras.toFixed(2)}
Total Fiado (Créditos):,S/. ${datos.totalFiados.toFixed(2)}
Total Cobrado:,S/. ${datos.totalPagos.toFixed(2)}
Ingresos Netos:,S/. ${(datos.totalVentas + datos.totalPagos).toFixed(2)}
`.trim();

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `reporte-sunat-${periodo}-${Date.now()}.csv`;
    link.click();

    toast({ title: "Reporte descargado", description: "El archivo CSV se descargó correctamente" });
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Reportes SUNAT</h1>
          <p className="text-muted-foreground mt-1">Resumen simple para declaración de impuestos (RUS)</p>
        </div>

        {/* Selector de período */}
        <Card className="p-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4">
            <div className="flex items-center gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <Select value={periodo} onValueChange={(v: PeriodoSUNAT) => setPeriodo(v)}>
                <SelectTrigger className="w-[250px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mes-actual">Mes Actual</SelectItem>
                  <SelectItem value="mes-anterior">Mes Anterior</SelectItem>
                  <SelectItem value="trimestre">Trimestre Actual</SelectItem>
                  <SelectItem value="anual">Año Actual</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button onClick={descargarReporte} className="sm:ml-auto">
              <Download className="mr-2 h-4 w-4" />
              Descargar Reporte CSV
            </Button>
          </div>
        </Card>

        {/* Resumen de datos */}
        {loading ? (
          <Card className="p-8">
            <p className="text-center text-muted-foreground">Cargando datos...</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-green-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Ventas</p>
                  <p className="text-2xl font-bold text-green-600">S/. {datos.totalVentas.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Ingresos por ventas en el período seleccionado</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-blue-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Compras</p>
                  <p className="text-2xl font-bold text-blue-600">S/. {datos.totalCompras.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Gastos en compras e inventario (opcional)</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-orange-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Fiado</p>
                  <p className="text-2xl font-bold text-orange-600">S/. {datos.totalFiados.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Créditos otorgados a clientes en el período</p>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-3 bg-purple-500/10 rounded-full">
                  <FileText className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Cobrado</p>
                  <p className="text-2xl font-bold text-purple-600">S/. {datos.totalPagos.toFixed(2)}</p>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">Pagos recibidos de deudas anteriores</p>
            </Card>
          </div>
        )}

        {/* Info adicional */}
        <Card className="p-6 bg-muted/50">
          <h3 className="font-semibold mb-3">ℹ️ Información para RUS</h3>
          <div className="space-y-2 text-sm text-muted-foreground">
            <p>• <strong>Total de Ventas</strong> = ingresos brutos del período.</p>
            <p>• <strong>Fiado</strong> y <strong>Cobrado</strong> para control interno.</p>
            <p>• <strong>Ingresos Netos</strong> = Ventas + Cobros (flujo real).</p>
            <p>• Es un resumen simplificado. Consulta con tu contador para la declaración oficial.</p>
          </div>
        </Card>
      </div>

      <ChatbotWidget />
    </Layout>
  );
};

export default ReportesSUNAT;
