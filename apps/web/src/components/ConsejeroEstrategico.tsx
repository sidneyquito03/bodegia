import { useEffect, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Info, Sparkles, Loader2 } from "lucide-react";
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

export const ConsejeroEstrategico = () => {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    obtenerRecomendaciones();
  }, []);

  const obtenerRecomendaciones = async () => {
    try {
      setLoading(true);

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

    setRecomendaciones(recs);
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
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-primary/10 rounded-full">
          <Sparkles className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
            El Consejero Estratégico
          </h2>
          <p className="text-sm text-muted-foreground">Recomendaciones inteligentes basadas en IA</p>
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="ml-auto"
          onClick={obtenerRecomendaciones}
          disabled={loading}
        >
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Actualizar"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-3 text-muted-foreground">Analizando datos...</span>
        </div>
      ) : (
        <div className="space-y-4">
          {recomendaciones.map((rec) => (
            <div key={rec.id} className="p-4 rounded-lg border bg-card hover:shadow-md transition-all group">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getPrioridadIcon(rec.prioridad)}
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {rec.titulo}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">{rec.descripcion}</p>
                  <div className="flex gap-2">
                    <Badge variant={getPrioridadColor(rec.prioridad as any)}>{rec.prioridad}</Badge>
                    <Badge variant="outline">{rec.categoria}</Badge>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

async function safe<T>(p: Promise<T>, fallback: T): Promise<T> {
  try { return await p } catch { return fallback }
}
