import { useEffect, useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { Download, FileText, Calendar, RefreshCcw, TrendingUp } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

// --- TIPOS Y DATOS SIMULADOS (MOCK) ---
type PeriodoSUNAT = "mes-actual" | "mes-anterior" | "trimestre" | "anual";

interface ReporteData {
    totalVentas: number;
    totalCompras: number;
    totalFiados: number;
    totalPagos: number;
}

// Datos de prueba con lógica de fechas creíble
const DATOS_SIMULADOS: Record<PeriodoSUNAT, ReporteData> = {
    "mes-actual": {
        totalVentas: 12450.50,  // Cifras del mes en curso
        totalCompras: 8200.00,
        totalFiados: 1500.20,
        totalPagos: 850.00
    },
    "mes-anterior": {
        totalVentas: 15890.00,  // Un mes completo suele tener más ventas
        totalCompras: 11500.50,
        totalFiados: 2100.00,
        totalPagos: 1900.00
    },
    "trimestre": {
        totalVentas: 45200.80,
        totalCompras: 32100.20,
        totalFiados: 5600.50,
        totalPagos: 4800.00
    },
    "anual": {
        totalVentas: 185600.00,
        totalCompras: 120500.00,
        totalFiados: 18000.00,
        totalPagos: 15500.00
    }
};

// Función de simulación que el componente usará
const getSunatSummaryMock = async ({ periodo }: { periodo: PeriodoSUNAT }): Promise<ReporteData> => {
    // Simulamos un retraso de red de 800ms
    await new Promise((resolve) => setTimeout(resolve, 800));
    return DATOS_SIMULADOS[periodo];
};


// --- COMPONENTE PRINCIPAL ---
const ReportesSUNAT = () => {
    // 1. Estados para el filtro y los datos
    const [periodo, setPeriodo] = useState<PeriodoSUNAT>("mes-actual");
    const [datos, setDatos] = useState<ReporteData>({ 
        totalVentas: 0, 
        totalCompras: 0, 
        totalFiados: 0, 
        totalPagos: 0 
    });
    const [loading, setLoading] = useState(false);
    const { toast } = useToast();

    // 2. Función para cargar datos (simulada)
    const cargarDatos = async () => {
        try {
            setLoading(true);
            const res = await getSunatSummaryMock({ periodo });
            setDatos(res);
        } catch (error) {
            console.error("Error cargando datos:", error);
            toast({ title: "Error", description: "No se pudieron cargar los datos", variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    // 3. Efecto: Cargar datos cada vez que cambia el periodo
    useEffect(() => {
        cargarDatos();
    }, [periodo]); // Se ejecuta cuando el 'periodo' cambia

    // 4. Texto del periodo para el CSV y el título
    const tituloPeriodo = useMemo(() => {
        switch (periodo) {
            case "mes-actual": return "Mes Actual";
            case "mes-anterior": return "Mes Anterior";
            case "trimestre": return "Trimestre Actual";
            case "anual": return "Año Actual";
        }
    }, [periodo]);

    // 5. Función de descarga (actualizada con los datos dinámicos)
    const descargarReporte = () => {
        const csv = `
REPORTE PARA SUNAT - RÉGIMEN ÚNICO SIMPLIFICADO (RUS)
Período: ${tituloPeriodo}
Fecha de generación: ${new Date().toLocaleDateString('es-PE')}

RESUMEN FINANCIERO:
Total de Ventas (Bruto):,S/. ${datos.totalVentas.toFixed(2)}
Total de Compras (Gastos):,S/. ${datos.totalCompras.toFixed(2)}
Total Fiado (Por cobrar):,S/. ${datos.totalFiados.toFixed(2)}
Total Cobrado (Deudas pasadas):,S/. ${datos.totalPagos.toFixed(2)}
`.trim();

        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `reporte-sunat-${periodo}-${Date.now()}.csv`;
        link.click();

        toast({ title: "Reporte descargado", description: `El archivo CSV del ${tituloPeriodo} se guardó correctamente` });
    };

    // 6. Formateo de números (para no repetir código en el HTML)
    const formatSoles = (value: number) => `S/. ${value.toLocaleString('es-PE', { minimumFractionDigits: 2 })}`;


    return (
        <Layout>
            <div className="space-y-6">
                
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">Reportes SUNAT</h1>
                        <p className="text-muted-foreground mt-1">Resumen financiero para declaración de impuestos</p>
                    </div>
                    {/* Botón de refrescar con animación de carga */}
                    <Button variant="outline" size="icon" onClick={cargarDatos} disabled={loading}>
                        <RefreshCcw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                    </Button>
                </div>

                {/* Filtros y Descarga */}
                <Card className="p-6 bg-white shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                        <div className="flex items-center gap-3 flex-1">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div className="flex-1 sm:flex-none sm:w-[250px]">
                                {/* Selector con lógica de cambio de estado */}
                                <Select 
                                    value={periodo} 
                                    onValueChange={(v: PeriodoSUNAT) => setPeriodo(v)}
                                    disabled={loading}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder={tituloPeriodo} />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="mes-actual">Mes Actual</SelectItem>
                                        <SelectItem value="mes-anterior">Mes Anterior</SelectItem>
                                        <SelectItem value="trimestre">Trimestre Actual</SelectItem>
                                        <SelectItem value="anual">Año Actual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        {/* Botón de descarga deshabilitado durante la carga */}
                        <Button 
                            onClick={descargarReporte} 
                            className="sm:ml-auto w-full sm:w-auto bg-green-600 hover:bg-green-700 text-white"
                            disabled={loading || datos.totalVentas === 0}
                        >
                            <Download className="mr-2 h-4 w-4" />
                            Descargar CSV
                        </Button>
                    </div>
                </Card>

                {/* Tarjetas de Resumen (Diseño recuperado + Datos dinámicos) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    
                    {/* 1. VENTAS TOTALES */}
                    <Card className="p-6 border-l-4 border-l-green-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-green-100 rounded-full">
                                <TrendingUp className="h-8 w-8 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Ventas (Bruto)</p>
                                <h3 className="text-2xl font-bold text-green-700">
                                    {loading ? "Cargando..." : formatSoles(datos.totalVentas)}
                                </h3>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 pl-1">
                            Ingresos totales registrados en caja
                        </p>
                    </Card>

                    {/* 2. COMPRAS */}
                    <Card className="p-6 border-l-4 border-l-blue-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-blue-100 rounded-full">
                                <FileText className="h-8 w-8 text-blue-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Compras</p>
                                <h3 className="text-2xl font-bold text-blue-700">
                                    {loading ? "Cargando..." : formatSoles(datos.totalCompras)}
                                </h3>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 pl-1">
                            Gastos en proveedores e inventario
                        </p>
                    </Card>

                    {/* 3. FIADOS */}
                    <Card className="p-6 border-l-4 border-l-orange-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-orange-100 rounded-full">
                                <FileText className="h-8 w-8 text-orange-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Total Fiado (Por Cobrar)</p>
                                <h3 className="text-2xl font-bold text-orange-700">
                                    {loading ? "Cargando..." : formatSoles(datos.totalFiados)}
                                </h3>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 pl-1">
                            Ventas a crédito (aún no cobradas)
                        </p>
                    </Card>

                    {/* 4. COBRADO */}
                    <Card className="p-6 border-l-4 border-l-purple-500 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-4">
                            <div className="p-3 bg-purple-100 rounded-full">
                                <FileText className="h-8 w-8 text-purple-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-muted-foreground">Pagos Recibidos</p>
                                <h3 className="text-2xl font-bold text-purple-700">
                                    {loading ? "Cargando..." : formatSoles(datos.totalPagos)}
                                </h3>
                            </div>
                        </div>
                        <p className="text-xs text-muted-foreground mt-2 pl-1">
                            Recuperación de deudas de clientes
                        </p>
                    </Card>
                </div>

                {/* Info adicional estilo RUS - AHORA DINÁMICA */}
                <Card className="p-5 bg-slate-50 border border-slate-200">
                    <div className="flex flex-col md:flex-row justify-between items-center gap-4">
                        <div className="text-sm text-slate-600">
                            <p>
                                <strong>Cálculo estimado RUS:</strong> Basado en ventas de 
                                <strong> {formatSoles(datos.totalVentas)}</strong>.
                            </p>
                        </div>
                        <div className="flex items-center gap-3">
                            <span className="text-sm font-semibold text-slate-500 uppercase">
                                Categoría / Pago a SUNAT:
                            </span>
                            <span className="text-xl font-bold text-slate-800">
                                {loading 
                                    ? "..." 
                                    : datos.totalVentas <= 5000 
                                        ? "S/. 20.00 (Cat. 1)" 
                                        : "S/. 50.00 (Cat. 2)"
                                }
                            </span>
                        </div>
                    </div>
                </Card>
            </div>

            <ChatbotWidget />
        </Layout>
    );
};

export default ReportesSUNAT;