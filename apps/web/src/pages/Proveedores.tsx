import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { ProveedorModal } from "@/components/modals/ProveedorModal";
import { EditarProveedorModal } from "@/components/modals/EditarProveedorModal";
import { Plus, Pencil, ToggleLeft, ToggleRight, Search, Package, Phone, Mail, Clock, History, Building2, DollarSign, TrendingUp } from "lucide-react";
import { useProveedores, type Proveedor } from "@/hooks/useProveedores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";


// --- TIPO DE COMPRA SIMPLIFICADO ---
interface CompraProveedor {
  id: string;
  proveedor_id: string;
  fecha_pedido: string;
  cantidad: number;
  precio_unitario: number;
  total: number;
  fecha_entrega_estimada: string;
  estado: "entregado" | "en tránsito" | "pendiente";
}


// --- DATOS FALSOS PARA HISTORIAL DE COMPRAS ---
const COMPRAS_INICIALES: CompraProveedor[] = [
  {
    id: "1",
    proveedor_id: "1",
    fecha_pedido: "2024-12-01",
    cantidad: 100,
    precio_unitario: 45.50,
    total: 4550.00,
    fecha_entrega_estimada: "2024-12-05",
    estado: "entregado"
  },
  {
    id: "2",
    proveedor_id: "1",
    fecha_pedido: "2024-11-28",
    cantidad: 50,
    precio_unitario: 45.50,
    total: 2275.00,
    fecha_entrega_estimada: "2024-12-02",
    estado: "entregado"
  },
  {
    id: "3",
    proveedor_id: "2",
    fecha_pedido: "2024-11-25",
    cantidad: 200,
    precio_unitario: 28.00,
    total: 5600.00,
    fecha_entrega_estimada: "2024-11-30",
    estado: "entregado"
  },
  {
    id: "4",
    proveedor_id: "2",
    fecha_pedido: "2024-12-05",
    cantidad: 150,
    precio_unitario: 28.00,
    total: 4200.00,
    fecha_entrega_estimada: "2024-12-10",
    estado: "pendiente"
  },
  {
    id: "5",
    proveedor_id: "3",
    fecha_pedido: "2024-12-03",
    cantidad: 75,
    precio_unitario: 120.00,
    total: 9000.00,
    fecha_entrega_estimada: "2024-12-08",
    estado: "en tránsito"
  },
  {
    id: "6",
    proveedor_id: "3",
    fecha_pedido: "2024-11-20",
    cantidad: 60,
    precio_unitario: 120.00,
    total: 7200.00,
    fecha_entrega_estimada: "2024-11-27",
    estado: "entregado"
  },
  {
    id: "7",
    proveedor_id: "1",
    fecha_pedido: "2024-12-06",
    cantidad: 80,
    precio_unitario: 45.50,
    total: 3640.00,
    fecha_entrega_estimada: "2024-12-12",
    estado: "pendiente"
  },
  {
    id: "8",
    proveedor_id: "4",
    fecha_pedido: "2024-12-02",
    cantidad: 120,
    precio_unitario: 35.75,
    total: 4290.00,
    fecha_entrega_estimada: "2024-12-07",
    estado: "entregado"
  },
  {
    id: "9",
    proveedor_id: "5",
    fecha_pedido: "2024-12-04",
    cantidad: 90,
    precio_unitario: 62.00,
    total: 5580.00,
    fecha_entrega_estimada: "2024-12-09",
    estado: "en tránsito"
  },
  {
    id: "10",
    proveedor_id: "6",
    fecha_pedido: "2024-11-30",
    cantidad: 200,
    precio_unitario: 15.99,
    total: 3198.00,
    fecha_entrega_estimada: "2024-12-04",
    estado: "entregado"
  },
  {
    id: "11",
    proveedor_id: "4",
    fecha_pedido: "2024-12-07",
    cantidad: 110,
    precio_unitario: 35.75,
    total: 3932.50,
    fecha_entrega_estimada: "2024-12-13",
    estado: "pendiente"
  },
  {
    id: "12",
    proveedor_id: "5",
    fecha_pedido: "2024-11-22",
    cantidad: 75,
    precio_unitario: 62.00,
    total: 4650.00,
    fecha_entrega_estimada: "2024-11-28",
    estado: "entregado"
  },
];


// --- PROVEEDORES DE EJEMPLO ---
const PROVEEDORES_INICIALES: Proveedor[] = [
  {
    id: "1",
    nombre: "Distribuidora Premium",
    ruc: "20123456789",
    contacto: "Juan Pérez",
    telefono: "+51 987 654 321",
    email: "contacto@distribuidora.pe",
    tiempo_entrega_dias: 5,
    activo: true
  },
  {
    id: "2",
    nombre: "Importadores El Centro",
    ruc: "20987654321",
    contacto: "María García",
    telefono: "+51 991 234 567",
    email: "ventas@importadores.pe",
    tiempo_entrega_dias: 7,
    activo: true
  },
  {
    id: "3",
    nombre: "Mayorista Comercial",
    ruc: "20555666777",
    contacto: "Carlos López",
    telefono: "+51 992 345 678",
    email: "pedidos@mayorista.pe",
    tiempo_entrega_dias: 4,
    activo: true
  },
  {
    id: "4",
    nombre: "Proveedora Del Norte",
    ruc: "20444555666",
    contacto: "Ana Rodríguez",
    telefono: "+51 988 123 456",
    email: "info@proveedoradelnorte.pe",
    tiempo_entrega_dias: 6,
    activo: true
  },
  {
    id: "5",
    nombre: "Comercial Andina",
    ruc: "20333444555",
    contacto: "Roberto Silva",
    telefono: "+51 993 567 890",
    email: "contacto@comercialandina.pe",
    tiempo_entrega_dias: 3,
    activo: true
  },
  {
    id: "6",
    nombre: "Distribuidora Sur",
    ruc: "20222333444",
    contacto: "Patricia Morales",
    telefono: "+51 994 678 901",
    email: "ventas@distribuidorasur.pe",
    tiempo_entrega_dias: 8,
    activo: true
  },
];


const Proveedores = () => {
  const { proveedores: proveedoresHook, loading, agregarProveedor, actualizarProveedor, toggleProveedor } = useProveedores();
  
  // Usar datos falsos si no hay proveedores en el hook
  const proveedores = proveedoresHook.length > 0 ? proveedoresHook : PROVEEDORES_INICIALES;
  const compras = COMPRAS_INICIALES;
  
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [proveedorSeleccionado, setProveedorSeleccionado] = useState<Proveedor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedProveedor, setSelectedProveedor] = useState<string | null>(null);


  const proveedoresFiltrados = proveedores.filter(p => 
    p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.ruc?.toLowerCase().includes(searchTerm.toLowerCase())
  );


  const comprasFiltradas = selectedProveedor 
    ? compras.filter(c => c.proveedor_id === selectedProveedor)
    : compras;


  // Calcular estadísticas
  const estadisticas = {
    totalProveedores: proveedores.length,
    comprasTotal: compras.length,
    gastosTotal: compras.reduce((acc, c) => acc + c.total, 0),
    comprasEntregadas: compras.filter(c => c.estado === "entregado").length,
  };


  const handleSelectProveedor = (proveedorId: string) => {
    setSelectedProveedor(proveedorId);
  };


  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "entregado":
        return "bg-green-50 text-green-700 border-green-200";
      case "en tránsito":
        return "bg-blue-50 text-blue-700 border-blue-200";
      case "pendiente":
        return "bg-amber-50 text-amber-700 border-amber-200";
      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };


  return (
    <Layout>
      <div className="space-y-6">
        {/* Header mejorado */}
        <div className="border-b pb-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold">Gestión de Proveedores</h1>
              <p className="text-muted-foreground mt-1">Administra tus proveedores y el historial de compras</p>
            </div>
            <Button className="gap-2" onClick={() => setModalOpen(true)}>
              <Plus className="h-4 w-4" />
              Nuevo Proveedor
            </Button>
          </div>
        </div>


        {/* Tarjetas de estadísticas */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-4 border border-border/50 bg-gradient-to-br from-blue-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Proveedores Activos</p>
                <p className="text-2xl font-bold mt-2">{estadisticas.totalProveedores}</p>
              </div>
              <Building2 className="h-8 w-8 text-blue-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 border border-border/50 bg-gradient-to-br from-purple-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Total Compras</p>
                <p className="text-2xl font-bold mt-2">{estadisticas.comprasTotal}</p>
              </div>
              <Package className="h-8 w-8 text-purple-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 border border-border/50 bg-gradient-to-br from-emerald-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Entregadas</p>
                <p className="text-2xl font-bold mt-2">{estadisticas.comprasEntregadas}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-emerald-500 opacity-20" />
            </div>
          </Card>

          <Card className="p-4 border border-border/50 bg-gradient-to-br from-orange-50/50 to-transparent hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground font-medium">Gasto Total</p>
                <p className="text-2xl font-bold mt-2">S/. {(estadisticas.gastosTotal / 1000).toFixed(1)}k</p>
              </div>
              <DollarSign className="h-8 w-8 text-orange-500 opacity-20" />
            </div>
          </Card>
        </div>


        <Tabs defaultValue="proveedores" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-muted/50 p-1 rounded-lg">
            <TabsTrigger value="proveedores" className="gap-2">
              <Building2 className="h-4 w-4" />
              Proveedores
            </TabsTrigger>
            <TabsTrigger value="historial" className="gap-2">
              <History className="h-4 w-4" />
              Historial de Compras
            </TabsTrigger>
          </TabsList>


          <TabsContent value="proveedores" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o RUC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 transition-all"
                />
              </div>
            </div>


            {loading ? (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">Cargando proveedores...</p>
              </Card>
            ) : proveedoresFiltrados.length === 0 ? (
              <Card className="p-12">
                <p className="text-center text-muted-foreground">
                  {searchTerm ? "No se encontraron proveedores" : "No hay proveedores registrados"}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proveedoresFiltrados.map((proveedor) => (
                  <Card 
                    key={proveedor.id} 
                    className="p-6 hover:shadow-lg transition-all border border-border/50 bg-card/50 backdrop-blur-sm hover:border-primary/50"
                  >
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{proveedor.nombre}</h3>
                          {proveedor.ruc && (
                            <p className="text-sm text-muted-foreground">RUC: {proveedor.ruc}</p>
                          )}
                          <Badge className="mt-3" variant={proveedor.activo ? "default" : "secondary"}>
                            {proveedor.activo ? "✓ Activo" : "✕ Inactivo"}
                          </Badge>
                        </div>
                      </div>


                      <div className="space-y-2.5 text-sm border-t pt-4">
                        {proveedor.contacto && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Package className="h-4 w-4 text-primary/60" />
                            <span className="truncate">{proveedor.contacto}</span>
                          </div>
                        )}
                        {proveedor.telefono && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Phone className="h-4 w-4 text-primary/60" />
                            <span className="truncate">{proveedor.telefono}</span>
                          </div>
                        )}
                        {proveedor.email && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Mail className="h-4 w-4 text-primary/60" />
                            <span className="truncate text-xs">{proveedor.email}</span>
                          </div>
                        )}
                        {proveedor.tiempo_entrega_dias > 0 && (
                          <div className="flex items-center gap-3 text-muted-foreground">
                            <Clock className="h-4 w-4 text-primary/60" />
                            <span>{proveedor.tiempo_entrega_dias} días de entrega</span>
                          </div>
                        )}
                      </div>


                      <div className="flex gap-2 pt-2 border-t">
                        <Button
                          variant="outline"
                          size="sm"
                          className="flex-1 gap-2"
                          onClick={() => {
                            setProveedorSeleccionado(proveedor);
                            setEditModalOpen(true);
                          }}
                        >
                          <Pencil className="h-4 w-4" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => toggleProveedor(proveedor.id, proveedor.activo)}
                          title={proveedor.activo ? "Desactivar" : "Activar"}
                        >
                          {proveedor.activo ? (
                            <ToggleRight className="h-4 w-4" />
                          ) : (
                            <ToggleLeft className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleSelectProveedor(proveedor.id)}
                          title="Ver compras"
                        >
                          <History className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>


          <TabsContent value="historial" className="space-y-4">
            <Card className="p-6 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-semibold flex items-center gap-2">
                    <History className="h-5 w-5 text-primary" />
                    Historial de Compras
                  </h2>
                  {selectedProveedor && (
                    <p className="text-sm text-muted-foreground mt-2">
                      Mostrando compras del proveedor seleccionado ({comprasFiltradas.length})
                    </p>
                  )}
                </div>
                {selectedProveedor && (
                  <Button 
                    variant="outline" 
                    size="sm"
                    onClick={() => setSelectedProveedor(null)}
                  >
                    Ver Todas
                  </Button>
                )}
              </div>

              {comprasFiltradas.length === 0 ? (
                <div className="text-center py-12">
                  <Package className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
                  <p className="text-muted-foreground">No hay compras registradas</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader className="bg-muted/30">
                      <TableRow className="border-b-2">
                        <TableHead className="font-semibold">Fecha Pedido</TableHead>
                        <TableHead className="font-semibold">Cantidad</TableHead>
                        <TableHead className="font-semibold">Precio Unit.</TableHead>
                        <TableHead className="font-semibold">Total</TableHead>
                        <TableHead className="font-semibold">Entrega Est.</TableHead>
                        <TableHead className="font-semibold">Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comprasFiltradas.map((compra) => (
                        <TableRow 
                          key={compra.id}
                          className="hover:bg-muted/30 transition-colors border-b border-border/30"
                        >
                          <TableCell className="font-medium">
                            {format(new Date(compra.fecha_pedido), "dd MMM yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="font-semibold">
                              {compra.cantidad}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">
                            S/. {compra.precio_unitario.toFixed(2)}
                          </TableCell>
                          <TableCell className="font-bold text-lg">
                            S/. {compra.total.toFixed(2)}
                          </TableCell>
                          <TableCell>
                            {compra.fecha_entrega_estimada
                              ? format(new Date(compra.fecha_entrega_estimada), "dd MMM yyyy", { locale: es })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant="outline"
                              className={`capitalize font-semibold ${getEstadoColor(compra.estado)}`}
                            >
                              {compra.estado === "en tránsito" ? "En Tránsito" : 
                               compra.estado.charAt(0).toUpperCase() + compra.estado.slice(1)}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>

                  {/* Resumen de compras */}
                  <div className="mt-6 pt-4 border-t border-border/30">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Total de Compras</p>
                        <p className="text-2xl font-bold mt-2">{comprasFiltradas.length}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Monto Total</p>
                        <p className="text-2xl font-bold mt-2">S/. {comprasFiltradas.reduce((acc, c) => acc + c.total, 0).toFixed(2)}</p>
                      </div>
                      <div className="bg-muted/30 p-4 rounded-lg">
                        <p className="text-sm text-muted-foreground">Promedio por Compra</p>
                        <p className="text-2xl font-bold mt-2">S/. {(comprasFiltradas.reduce((acc, c) => acc + c.total, 0) / comprasFiltradas.length).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          </TabsContent>
        </Tabs>
      </div>


      <ProveedorModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSave={agregarProveedor}
      />


      <EditarProveedorModal
        isOpen={editModalOpen}
        onClose={() => {
          setEditModalOpen(false);
          setProveedorSeleccionado(null);
        }}
        onSave={actualizarProveedor}
        proveedor={proveedorSeleccionado}
      />


      <ChatbotWidget />
    </Layout>
  );
};


export default Proveedores;
