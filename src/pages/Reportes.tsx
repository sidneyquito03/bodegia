import { Layout } from "@/components/Layout";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { DollarSign, TrendingUp, Package } from "lucide-react";

const Reportes = () => {
  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Reportes</h1>
          <p className="text-muted-foreground mt-1">Análisis y métricas de tu bodega</p>
        </div>

        <Tabs defaultValue="ventas" className="space-y-6">
          <TabsList className="grid w-full md:w-auto md:inline-grid grid-cols-3">
            <TabsTrigger value="ventas">Ventas y Ganancias</TabsTrigger>
            <TabsTrigger value="productos">Productos</TabsTrigger>
            <TabsTrigger value="fiados">Fiados</TabsTrigger>
          </TabsList>

          <TabsContent value="ventas" className="space-y-6">
            {/* KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                title="Ventas del Mes"
                value="S/. 38,450.00"
                icon={<DollarSign className="h-6 w-6" />}
                trend={{ value: "+15.3%", isPositive: true }}
              />
              <KPICard
                title="Ganancias del Mes"
                value="S/. 11,535.00"
                icon={<TrendingUp className="h-6 w-6" />}
                trend={{ value: "+12.8%", isPositive: true }}
              />
              <KPICard
                title="Margen Promedio"
                value="30.0%"
                icon={<TrendingUp className="h-6 w-6" />}
              />
            </div>

            {/* Gráfico */}
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Tendencia de Ventas (30 días)</h3>
              <div className="h-64 flex items-end justify-between gap-1">
                {Array.from({ length: 30 }).map((_, index) => {
                  const value = Math.random() * 200 + 100;
                  return (
                    <div 
                      key={index}
                      className="flex-1 bg-primary rounded-t hover:bg-primary-light transition-colors"
                      style={{ height: `${(value / 300) * 100}%` }}
                    />
                  );
                })}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="productos" className="space-y-6">
            <Card className="p-6 shadow-card">
              <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
              <div className="space-y-4">
                {[
                  { nombre: "Inca Kola 1.5L", ventas: 234, ingresos: 1170 },
                  { nombre: "Pan Bimbo Blanco", ventas: 189, ingresos: 1134 },
                  { nombre: "Leche Gloria", ventas: 156, ingresos: 858 },
                  { nombre: "Arroz Superior 1kg", ventas: 145, ingresos: 652.50 },
                  { nombre: "Aceite Primor", ventas: 98, ingresos: 1176 },
                ].map((producto, index) => (
                  <div key={index} className="flex items-center gap-4">
                    <div className="flex-1">
                      <p className="font-medium">{producto.nombre}</p>
                      <p className="text-sm text-muted-foreground">
                        {producto.ventas} unidades vendidas
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        S/. {producto.ingresos.toFixed(2)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          <TabsContent value="fiados" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <KPICard
                title="Fiado del Mes"
                value="S/. 3,240.00"
                icon={<DollarSign className="h-6 w-6" />}
              />
              <KPICard
                title="Cobrado del Mes"
                value="S/. 2,870.00"
                icon={<TrendingUp className="h-6 w-6" />}
              />
              <KPICard
                title="Pendiente"
                value="S/. 2,340.00"
                icon={<Package className="h-6 w-6" />}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>

      <ChatbotWidget />
    </Layout>
  );
};

export default Reportes;
