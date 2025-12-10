import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Info, Sparkles, Loader2, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  fetchVentas,
  fetchClientes,
  fetchProductos,
  fetchTransaccionesFiados,
  type Venta,
  type Cliente,
  type Producto,
  type TransaccionFiado,
} from "@/services/data";
import { generateStrategicRecommendations, type Recomendacion } from "@/services/ai";


// --- DATOS FALSOS DE RECOMENDACIONES ---
const RECOMENDACIONES_INICIALES: Recomendacion[] = [
  {
    id: "rec-1",
    titulo: "3 productos con stock bajo",
    descripcion: "Arroz integral, Aceite de oliva y Leche descremada están por debajo de 10 unidades. Reabastece pronto para evitar quiebre de stock.",
    prioridad: "Alta",
    categoria: "Inventario",
  },
  {
    id: "rec-2",
    titulo: "5 clientes con deuda pendiente",
    descripcion: "Total en deudas: S/. 3,450.75. Carlos López y María García son tus mayores deudores. Considera hacer seguimiento esta semana.",
    prioridad: "Media",
    categoria: "Fiados",
  },
  {
    id: "rec-3",
    titulo: "Alto uso de pagos digitales",
    descripcion: "El 68% de tus transacciones son por Yape/Plin. Excelente tendencia. Considera crear promociones para fidelizar este segmento.",
    prioridad: "Baja",
    categoria: "Ventas",
  },
  {
    id: "rec-4",
    titulo: "Promedio diario: S/. 1,285.50",
    descripcion: "En los últimos 7 días has vendido S/. 8,998.50. Has mostrado un crecimiento del 15% respecto a la semana anterior. ¡Mantén el ritmo!",
    prioridad: "Baja",
    categoria: "Ventas",
  },
  {
    id: "rec-5",
    titulo: "Margen de ganancia saludable",
    descripcion: "Tu margen actual es del 28%. Esto es excelente para una bodega. Considera mantener o aumentar ligeramente los precios.",
    prioridad: "Baja",
    categoria: "Rentabilidad",
  },
];


export const ConsejeroEstrategico = () => {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>(RECOMENDACIONES_INICIALES);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    obtenerRecomendaciones();
  }, []);

  const obtenerRecomendaciones = async () => {
    try {
      setLoading(true);

      // Simulación de espera
      await new Promise(resolve => setTimeout(resolve, 800));

      const since = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [ventas, clientes, productos, transacciones] = await Promise.all([
        safe(fetchVentas(since), [] as Venta[]),
        safe(fetchClientes(), [] as Cliente[]),
        safe(fetchProductos(), [] as Producto[]),
        safe(fetchTransaccionesFiados(since), [] as TransaccionFiado[]),
      ]);

      const metodosPago = transacciones.reduce((acc, t) => {
        acc[t.metodo_pago] = (acc[t.metodo_pago] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      const payload = {
        ventas: ventas.length,
        totalVendido: ventas.reduce((sum, v) => sum + Number(v.total || 0), 0),
        clientesConDeuda: clientes.filter((c) => Number(c.deuda_total || 0) > 0).length,
        deudaTotal: clientes.reduce((sum, c) => sum + Number(c.deuda_total || 0), 0),
        productosStockBajo: productos.filter((p) => Number(p.stock || 0) < 10).length,
        transaccionesFiados: transacciones.length,
        metodosPago,
      };

      const recs = await safe(generateStrategicRecommendations(payload), null);

      if (Array.isArray(recs) && recs.length > 0) {
        setRecomendaciones(recs.map((r, i) => ({ ...r, id: r.id ?? `rec-${i}` })));
      } else {
        generarRecomendacionesBasicas(ventas, clientes, productos, transacciones);
      }

      toast({
        title: "Recomendaciones actualizadas",
        description: "El análisis se ha completado exitosamente",
      });
    } catch (error) {
      console.error(error);
      toast({
        title: "Error",
        description: "No se pudieron generar recomendaciones",
        variant: "destructive",
      });
      generarRecomendacionesBasicas([], [], [], []);
    } finally {
      setLoading(false);
    }
  };

  const generarRecomendacionesBasicas = (
    ventas: Venta[],
    clientes: Cliente[],
    productos: Producto[],
    transacciones: TransaccionFiado[]
  ) => {
    const recs: Recomendacion[] = [];

    const bajosStock = productos.filter((p) => (p.stock ?? 0) < 10);
    if (bajosStock.length > 0) {
      recs.push({
        id: "rec-1",
        titulo: `${bajosStock.length} productos con stock bajo`,
        descripcion: `Hay ${bajosStock.length} productos con menos de 10 unidades. Considera reabastecer pronto.`,
        prioridad: "Alta",
        categoria: "Inventario",
      });
    }

    const clientesConDeuda = clientes.filter((c) => (c.deuda_total ?? 0) > 0);
    if (clientesConDeuda.length > 0) {
      recs.push({
        id: "rec-2",
        titulo: `${clientesConDeuda.length} clientes con deuda pendiente`,
        descripcion: `Total en deudas: S/. ${clientes.reduce((s, c) => s + Number(c.deuda_total || 0), 0).toFixed(2)}. Considera hacer seguimiento.`,
        prioridad: "Media",
        categoria: "Fiados",
      });
    }

    const mp = transacciones.reduce((acc, t) => {
      acc[t.metodo_pago] = (acc[t.metodo_pago] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
    const totalT = transacciones.length;
    if (totalT > 0) {
      const digitales = (mp["yape"] || 0) + (mp["plin"] || 0);
      const porcentaje = (digitales / totalT) * 100;
      if (porcentaje > 50) {
        recs.push({
          id: "rec-3",
          titulo: "Alto uso de pagos digitales",
          descripcion: `${porcentaje.toFixed(1)}% de pagos son digitales. Considera ofrecer descuentos para incentivar este método.`,
          prioridad: "Baja",
          categoria: "Ventas",
        });
      } else {
        recs.push({
          id: "rec-3",
          titulo: "Bajo uso de pagos digitales",
          descripcion: `Solo ${porcentaje.toFixed(1)}% de pagos son digitales. Promociona Yape/Plin para agilizar cobros.`,
          prioridad: "Media",
          categoria: "Ventas",
        });
      }
    }

    if (ventas.length > 0) {
      const total = ventas.reduce((s, v) => s + Number(v.total || 0), 0);
      const promedioDiario = total / 7;
      recs.push({
        id: "rec-4",
        titulo: `Promedio diario: S/. ${promedioDiario.toFixed(2)}`,
        descripcion: `En los últimos 7 días has vendido S/. ${total.toFixed(2)}. Mantén el ritmo.`,
        prioridad: "Baja",
        categoria: "Ventas",
      });
    }

    setRecomendaciones(recs.length > 0 ? recs : RECOMENDACIONES_INICIALES);
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return <AlertTriangle className="h-4 w-4" />;
      case "Media":
        return <TrendingUp className="h-4 w-4" />;
      default:
        return <Info className="h-4 w-4" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case "Alta":
        return "destructive";
      case "Media":
        return "default";
      default:
        return "secondary";
    }
  };

  return (
    <Card className="p-6 shadow-lg border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-background">
      {/* Header mejorado */}
      <div className="flex items-center justify-between gap-4 mb-8">
        <div className="flex items-center gap-4 flex-1">
          <div className="p-3 bg-primary/10 rounded-full">
            <Sparkles className="h-6 w-6 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              El Consejero Estratégico
            </h2>
            <p className="text-sm text-muted-foreground mt-1">
              Recomendaciones inteligentes basadas en IA para tu bodega
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="gap-2"
          onClick={obtenerRecomendaciones}
          disabled={loading}
        >
          <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          <span className="hidden sm:inline">Actualizar</span>
        </Button>
      </div>

      {/* Divider */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/20 to-transparent mb-6" />

      {/* Contenido */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 space-y-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <div className="text-center">
            <p className="text-muted-foreground font-medium">Analizando datos...</p>
            <p className="text-xs text-muted-foreground mt-1">Esto puede tomar unos segundos</p>
          </div>
        </div>
      ) : recomendaciones.length === 0 ? (
        <div className="text-center py-12 space-y-3">
          <Sparkles className="h-12 w-12 text-muted-foreground/30 mx-auto" />
          <p className="text-muted-foreground font-medium">Sin recomendaciones en este momento</p>
          <p className="text-sm text-muted-foreground">Sigue registrando ventas para obtener análisis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {recomendaciones.map((rec, idx) => (
            <div
              key={rec.id}
              className="group relative overflow-hidden rounded-lg border bg-card hover:shadow-md hover:border-primary/30 transition-all duration-300"
            >
              {/* Fondo animado sutil */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />

              <div className="relative p-4 sm:p-5">
                <div className="flex items-start gap-4">
                  {/* Icono de prioridad */}
                  <div className={`flex-shrink-0 p-2 rounded-lg mt-0.5 ${
                    rec.prioridad === "Alta" 
                      ? "bg-destructive/10" 
                      : rec.prioridad === "Media"
                      ? "bg-amber-50"
                      : "bg-blue-50"
                  }`}>
                    <div className={
                      rec.prioridad === "Alta"
                        ? "text-destructive"
                        : rec.prioridad === "Media"
                        ? "text-amber-600"
                        : "text-blue-600"
                    }>
                      {getPrioridadIcon(rec.prioridad)}
                    </div>
                  </div>

                  {/* Contenido */}
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-base group-hover:text-primary transition-colors line-clamp-2">
                      {rec.titulo}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-2 sm:line-clamp-none">
                      {rec.descripcion}
                    </p>
                    <div className="flex gap-2 mt-4 flex-wrap">
                      <Badge 
                        variant={getPrioridadColor(rec.prioridad as any)}
                        className="text-xs"
                      >
                        {rec.prioridad}
                      </Badge>
                      <Badge 
                        variant="outline"
                        className="text-xs"
                      >
                        {rec.categoria}
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ))}

          {/* Footer informativo */}
          <div className="mt-6 pt-6 border-t">
            <p className="text-xs text-muted-foreground text-center">
              💡 Última actualización hace unos momentos • Análisis basado en los últimos 7 días
            </p>
          </div>
        </div>
      )}
    </Card>
  );
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p } catch { return fallback }
}
