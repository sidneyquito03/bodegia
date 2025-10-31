import { useEffect, useState } from "react";
import { Layout } from "@/components/Layout";
import { KPICard } from "@/components/KPICard";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { ConsejeroEstrategico } from "@/components/ConsejeroEstrategico";
import { DollarSign, TrendingUp, AlertCircle, CreditCard,Package,ShoppingCart, Eye,TrendingDown
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Line } from 'react-chartjs-2';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Dashboard = () => {
  const navigate = useNavigate();
  const [kpis, setKpis] = useState({
    ventaHoy: 0,
    gananciaHoy: 0,
    deudaTotal: 0,
    alertas: 0,
    detallesVentas: [] as any[],
    detallesDeudas: [] as any[],
    detallesAlertas: [] as any[],
  });
  
  const [detallesModal, setDetallesModal] = useState<{
    open: boolean;
    type: 'ventas' | 'deudas' | 'alertas' | 'ganancias'| null;
    title: string;
  }>({
    open: false,
    type: null,
    title: ''
  });

  const [periodo, setPeriodo] = useState('hoy');
  const [ventasPorPeriodo, setVentasPorPeriodo] = useState<any[]>([]);
  const [chartData, setChartData] = useState({
    labels: [],
    datasets: [{
      label: 'Ventas',
      data: [],
      borderColor: 'rgb(75, 192, 192)',
      fill: false
    }]
  });

  useEffect(() => {
    fetchKPIs();
    fetchHistorial();
  }, [periodo]);
  
    const fetchKPIs = async () => {
    const hoy = new Date();
    hoy.setHours(0, 0, 0, 0);

    const { data: ventas } = await supabase.from('ventas').select('*').gte('created_at', hoy.toISOString());
    const ventaHoy = ventas?.reduce((sum, v) => sum + parseFloat(v.total.toString()), 0) || 0;

    const { data: clientes } = await supabase.from('clientes').select('*').gt('deuda_total', 0);
    const deudaTotal = clientes?.reduce((sum, c) => sum + parseFloat(c.deuda_total.toString()), 0) || 0;

    const { data: productos } = await supabase.from('productos').select('*').lt('stock', 10);

    let gananciaHoy = 0;
    if (ventas) {
      for (const venta of ventas) {
        const items = venta.items as any[];
        for (const item of items) {
          const { data: producto } = await supabase.from('productos').select('precio_costo').eq('id', item.producto_id).single();
          if (producto) {
            const gananciaItem = (item.precio - producto.precio_costo) * item.cantidad;
            gananciaHoy += gananciaItem;
          }
        }
      }
    }

    setKpis({
      ventaHoy,
      gananciaHoy,
      deudaTotal,
      alertas: productos?.length || 0,
      detallesVentas: ventas || [],
      detallesDeudas: clientes || [],
      detallesAlertas: productos || []
    });
  };

  const fetchHistorial = async () => {
    let fechaInicio = new Date();
    switch(periodo) {
      case 'semana':
        fechaInicio.setDate(fechaInicio.getDate() - 7);
        break;
      case 'mes':
        fechaInicio.setMonth(fechaInicio.getMonth() - 1);
        break;
      case 'año':
        fechaInicio.setFullYear(fechaInicio.getFullYear() - 1);
        break;
      default:
        fechaInicio.setHours(0, 0, 0, 0);
    }

    const { data: ventas } = await supabase.from('ventas').select('*').gte('created_at', fechaInicio.toISOString()).order('created_at');
    setVentasPorPeriodo(ventas || []);

  const ventasCobrado = ventas?.filter(v => v.tipo === 'efectivo');
  const ventasFiado = ventas?.filter(v => v.tipo === 'fiado');

    const labels = ventas?.map(v => new Date(v.created_at).toLocaleDateString()) || [];
    const data = ventas?.map(v => parseFloat(v.total.toString())) || [];
    const dataCobrado = ventasCobrado?.map(v => parseFloat(v.total.toString())) || [];
  const dataFiado = ventasFiado?.map(v => parseFloat(v.total.toString())) || [];


  setChartData({
      labels,
      datasets: [{
        label: 'Ventas',
        data,
        borderColor: 'rgb(75, 192, 192)',
        fill: false
      },
        {
        label: 'Cobrado',
        data: dataCobrado,
        borderColor: 'rgb(75, 192, 192)',
        fill: false,
      },
      {
        label: 'Fiado',
        data: dataFiado,
        borderColor: 'rgb(255, 99, 132)',
        fill: false,
      }
    ]
    });
  };

  const abrirDetalles = (type: 'ventas' | 'deudas' | 'alertas') => {
    let title = '';
    switch(type) {
      case 'ventas':
        title = 'Detalle de Ventas Hoy';
        break;
      case 'deudas':
        title = 'Detalle de Deudas';
        break;
      case 'alertas':
        title = 'Productos con Stock Bajo';
        break;
    }
    setDetallesModal({ open: true, type, title });
  };

  return (
    <Layout>
      <div className="space-y-6 sm:space-y-8">
        {/* Header */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground mt-1 text-sm sm:text-base">Resumen de tu bodega en tiempo real</p>
        </div>

         {/* KPIs */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div onClick={() => abrirDetalles('ventas')} className="cursor-pointer">
            <KPICard title="Venta Hoy" value={`S/. ${kpis.ventaHoy.toFixed(2)}`} icon={<DollarSign className="h-5 w-5 sm:h-6 sm:w-6" />} trend={{ value: "+12.5%", isPositive: true }}
            comparisonText="vs. el día anterior" />
          </div>
          <KPICard title="Ganancia Hoy" value={`S/. ${kpis.gananciaHoy.toFixed(2)}`} icon={<TrendingUp className="h-5 w-5 sm:h-6 sm:w-6" />} trend={{ value: "+8.3%", isPositive: true }} 
            comparisonText="vs. el día anterior" />
          <div onClick={() => abrirDetalles('deudas')} className="cursor-pointer">
            <KPICard title="Deuda Total" value={`S/. ${kpis.deudaTotal.toFixed(2)}`} icon={<CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />} />
          </div>
          <div onClick={() => abrirDetalles('alertas')} className="cursor-pointer">
            <KPICard title="Alertas" value={kpis.alertas} icon={<AlertCircle className="h-5 w-5 sm:h-6 sm:w-6" />} />
          </div>
        </div>
        
            {/* Consejero Estratégico */}
        <ConsejeroEstrategico />
        {/* Quick Actions */}
        <Card className="p-4 sm:p-6 shadow-card">
          <h3 className="text-lg font-semibold mb-4">Acciones Rápidas</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <Button onClick={() => navigate('/pos')} className="h-auto py-4 flex-col gap-2">
              <ShoppingCart className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Nueva Venta</span>
            </Button>
            <Button onClick={() => navigate('/inventario')} variant="outline" className="h-auto py-4 flex-col gap-2">
              <Package className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Agregar Producto</span>
            </Button>
            <Button onClick={() => navigate('/fiados')} variant="outline" className="h-auto py-4 flex-col gap-2">
              <CreditCard className="h-5 w-5 sm:h-6 sm:w-6" />
              <span className="text-sm sm:text-base">Registrar Pago</span>
            </Button>
          </div>
        </Card>

        {/* Historial y gráficos */}
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
            <h3 className="text-lg sm:text-xl font-semibold">Historial de Ventas</h3>
            <Select value={periodo} onValueChange={setPeriodo}>
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
                <Line data={chartData} options={{
                  responsive: true,
                  scales: {
                    x: {
                      title: {
                        display: true,
                        text: 'Fecha'
                      }
                    },
                    y: {
                      title: {
                        display: true,
                        text: 'Ventas (S/.)'
                      }
                    }
                  }
                }}
                />
              </div>
            </Card>
          </div>
        </div>

        {/* Modal de Detalles */}
        <Dialog open={detallesModal.open} onOpenChange={(open) => setDetallesModal({ ...detallesModal, open })}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{detallesModal.title}</DialogTitle>
            </DialogHeader>
            <div className="space-y-3">
              {detallesModal.type === 'ventas' && kpis.detallesVentas.map((venta, i) => (
           <div key={venta.id} className="p-4 mb-3 border rounded-lg shadow-sm hover:shadow-md bg-white transition-all">
            <div className="flex justify-between">
            <span className="font-medium text-lg">Venta #{i + 1}</span>
            <span className="font-bold text-primary text-xl">S/. {parseFloat(venta.total).toFixed(2)}</span>
          </div>
          <p className="text-sm text-muted-foreground mt-2">
            Fecha: {new Date(venta.created_at).toLocaleString('es-PE')}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            Tipo de pago: {venta.tipo}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {venta.estado === 'fiado' ? 'Pago: Fiado' : 'Pago: Cobrado'}
          </p>
        </div>

              ))}
              
              {detallesModal.type === 'deudas' && kpis.detallesDeudas.map((cliente) => (
                <div key={cliente.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between">
                    <span className="font-medium">{cliente.nombre}</span>
                    <span className="font-bold text-destructive">S/. {parseFloat(cliente.deuda_total).toFixed(2)}</span>
                  </div>
                  <p className="text-sm text-muted-foreground">{cliente.celular}</p>
                </div>
              ))}
              
              {detallesModal.type === 'alertas' && kpis.detallesAlertas.map((producto) => (
                <div key={producto.id} className="p-3 border rounded-lg">
                  <div className="flex justify-between items-center">
                    <div>
                      <span className="font-medium block">{producto.nombre}</span>
                      <span className="text-sm text-muted-foreground">{producto.codigo}</span>
                    </div>
                    <div className="text-right">
                      <span className={`font-bold ${producto.stock < 5 ? 'text-destructive' : 'text-orange-600'}`}>
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
