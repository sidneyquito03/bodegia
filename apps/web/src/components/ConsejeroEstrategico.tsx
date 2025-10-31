import { useState, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp, Info, Sparkles, Loader2 } from "lucide-react";
//import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Recomendacion {
  id: string;
  titulo: string;
  descripcion: string;
  prioridad: 'Alta' | 'Media' | 'Baja';
  categoria: string;
}

/*export const ConsejeroEstrategico = () => {
  const [recomendaciones, setRecomendaciones] = useState<Recomendacion[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    obtenerRecomendaciones();
  }, []);

  const obtenerRecomendaciones = async () => {
    try {
      setLoading(true);
      
      // Obtener datos para análisis
      const [ventasRes, fiadosRes, productosRes, transaccionesRes] = await Promise.all([
        supabase.from('ventas').select('*').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()),
        supabase.from('clientes').select('*'),
        supabase.from('productos').select('*'),
        supabase.from('transacciones_fiados').select('*').gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
      ]);

      const ventas = ventasRes.data || [];
      const clientes = fiadosRes.data || [];
      const productos = productosRes.data || [];
      const transacciones = transaccionesRes.data || [];

      // Llamar a la IA para generar recomendaciones
      const { data, error } = await supabase.functions.invoke('chat-assistant', {
        body: {
          message: `Analiza estos datos y genera 5 recomendaciones estratégicas con prioridad (Alta/Media/Baja):
          
Ventas última semana: ${ventas.length}
Total vendido: S/. ${ventas.reduce((sum, v) => sum + Number(v.total), 0).toFixed(2)}
Clientes con deuda: ${clientes.filter(c => c.deuda_total > 0).length}
Deuda total: S/. ${clientes.reduce((sum, c) => sum + Number(c.deuda_total), 0).toFixed(2)}
Productos bajo stock: ${productos.filter(p => p.stock < 10).length}
Transacciones fiados: ${transacciones.length}
Métodos de pago: ${JSON.stringify(transacciones.reduce((acc, t) => {
  acc[t.metodo_pago] = (acc[t.metodo_pago] || 0) + 1;
  return acc;
}, {} as Record<string, number>))}

Responde SOLO con un JSON array en este formato exacto:
[{
  "titulo": "Título corto",
  "descripcion": "Descripción detallada",
  "prioridad": "Alta|Media|Baja",
  "categoria": "Ventas|Inventario|Fiados|Operaciones"
}]`
        }
      });

      if (error) throw error;

      try {
        const respuestaIA = data.response;
        const jsonMatch = respuestaIA.match(/\[[\s\S]*\]/);
        if (jsonMatch) {
          const recsGeneradas = JSON.parse(jsonMatch[0]);
          setRecomendaciones(recsGeneradas.map((r: any, i: number) => ({
            ...r,
            id: `rec-${i}`
          })));
        } else {
          throw new Error('No se pudo extraer JSON');
        }
      } catch (parseError) {
        console.error('Error parseando respuesta IA:', parseError);
        // Fallback a recomendaciones estáticas
        generarRecomendacionesBasicas(ventas, clientes, productos, transacciones);
      }

    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: "No se pudieron generar recomendaciones",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const generarRecomendacionesBasicas = (ventas: any[], clientes: any[], productos: any[], transacciones: any[]) => {
    const recs: Recomendacion[] = [];

    // Análisis de stock
    const bajosStock = productos.filter(p => p.stock < 10);
    if (bajosStock.length > 0) {
      recs.push({
        id: 'rec-1',
        titulo: `${bajosStock.length} productos con stock bajo`,
        descripcion: `Hay ${bajosStock.length} productos con menos de 10 unidades. Considera reabastecer pronto.`,
        prioridad: 'Alta',
        categoria: 'Inventario'
      });
    }

    // Análisis de deudas
    const clientesConDeuda = clientes.filter(c => c.deuda_total > 0);
    if (clientesConDeuda.length > 0) {
      recs.push({
        id: 'rec-2',
        titulo: `${clientesConDeuda.length} clientes con deuda pendiente`,
        descripcion: `Total en deudas: S/. ${clientes.reduce((sum, c) => sum + Number(c.deuda_total), 0).toFixed(2)}. Considera hacer seguimiento.`,
        prioridad: 'Media',
        categoria: 'Fiados'
      });
    }

    // Análisis de métodos de pago
    const metodosPago = transacciones.reduce((acc, t) => {
      acc[t.metodo_pago] = (acc[t.metodo_pago] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const totalTransacciones = transacciones.length;
    if (totalTransacciones > 0) {
      const digitales = (metodosPago['yape'] || 0) + (metodosPago['plin'] || 0);
      const porcentajeDigital = (digitales / totalTransacciones) * 100;
      
      if (porcentajeDigital > 50) {
        recs.push({
          id: 'rec-3',
          titulo: 'Alto uso de pagos digitales',
          descripcion: `${porcentajeDigital.toFixed(1)}% de pagos son digitales. Considera ofrecer descuentos para incentivar este método.`,
          prioridad: 'Baja',
          categoria: 'Ventas'
        });
      } else {
        recs.push({
          id: 'rec-3',
          titulo: 'Bajo uso de pagos digitales',
          descripcion: `Solo ${porcentajeDigital.toFixed(1)}% de pagos son digitales. Promociona Yape/Plin para agilizar cobros.`,
          prioridad: 'Media',
          categoria: 'Ventas'
        });
      }
    }

    // Análisis de ventas
    if (ventas.length > 0) {
      const totalVentas = ventas.reduce((sum, v) => sum + Number(v.total), 0);
      const promedioDiario = totalVentas / 7;
      
      recs.push({
        id: 'rec-4',
        titulo: `Promedio diario: S/. ${promedioDiario.toFixed(2)}`,
        descripcion: `En los últimos 7 días has vendido S/. ${totalVentas.toFixed(2)}. Mantén el ritmo.`,
        prioridad: 'Baja',
        categoria: 'Ventas'
      });
    }

    setRecomendaciones(recs);
  };

  const getPrioridadIcon = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return <AlertTriangle className="h-4 w-4" />;
      case 'Media': return <TrendingUp className="h-4 w-4" />;
      default: return <Info className="h-4 w-4" />;
    }
  };

  const getPrioridadColor = (prioridad: string) => {
    switch (prioridad) {
      case 'Alta': return 'destructive';
      case 'Media': return 'default';
      default: return 'secondary';
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
          {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Actualizar'}
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
            <div 
              key={rec.id} 
              className="p-4 rounded-lg border bg-card hover:shadow-md transition-all group"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    {getPrioridadIcon(rec.prioridad)}
                    <h3 className="font-semibold group-hover:text-primary transition-colors">
                      {rec.titulo}
                    </h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-3">
                    {rec.descripcion}
                  </p>
                  <div className="flex gap-2">
                    <Badge variant={getPrioridadColor(rec.prioridad as any)}>
                      {rec.prioridad}
                    </Badge>
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
};*/
