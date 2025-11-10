import { useState } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { ProveedorModal } from "@/components/modals/ProveedorModal";
import { EditarProveedorModal } from "@/components/modals/EditarProveedorModal";
import { Plus, Pencil, ToggleLeft, ToggleRight, Search, Package, Phone, Mail, Clock, History } from "lucide-react";
import { useProveedores, type Proveedor, type CompraProveedor } from "@/hooks/useProveedores";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { format } from "date-fns";
import { es } from "date-fns/locale";


const Proveedores = () => {
  const { proveedores, compras, loading, agregarProveedor, actualizarProveedor, toggleProveedor, fetchCompras } = useProveedores();
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

  const handleSelectProveedor = (proveedorId: string) => {
    setSelectedProveedor(proveedorId);
    fetchCompras(proveedorId);
  };

  return (
    <Layout>
      <div className="space-y-6">
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

        <Tabs defaultValue="proveedores" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="proveedores">Proveedores</TabsTrigger>
            <TabsTrigger value="historial">Historial de Compras</TabsTrigger>
          </TabsList>

          <TabsContent value="proveedores" className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Buscar por nombre o RUC..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {loading ? (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">Cargando...</p>
              </Card>
            ) : proveedoresFiltrados.length === 0 ? (
              <Card className="p-8">
                <p className="text-center text-muted-foreground">
                  {searchTerm ? "No se encontraron proveedores" : "No hay proveedores registrados"}
                </p>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {proveedoresFiltrados.map((proveedor) => (
                  <Card key={proveedor.id} className="p-6 hover:shadow-lg transition-shadow">
                    <div className="space-y-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg">{proveedor.nombre}</h3>
                          {proveedor.ruc && (
                            <p className="text-sm text-muted-foreground">RUC: {proveedor.ruc}</p>
                          )}
                          <Badge className="mt-2" variant={proveedor.activo ? "default" : "secondary"}>
                            {proveedor.activo ? "Activo" : "Inactivo"}
                          </Badge>
                        </div>
                      </div>

                      <div className="space-y-2 text-sm">
                        {proveedor.contacto && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Package className="h-4 w-4" />
                            <span>{proveedor.contacto}</span>
                          </div>
                        )}
                        {proveedor.telefono && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone className="h-4 w-4" />
                            <span>{proveedor.telefono}</span>
                          </div>
                        )}
                        {proveedor.email && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Mail className="h-4 w-4" />
                            <span className="truncate">{proveedor.email}</span>
                          </div>
                        )}
                        {proveedor.tiempo_entrega_dias > 0 && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Clock className="h-4 w-4" />
                            <span>{proveedor.tiempo_entrega_dias} días de entrega</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-2">
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
                        >
                          {proveedor.activo ? (
                            <ToggleLeft className="h-4 w-4" />
                          ) : (
                            <ToggleRight className="h-4 w-4" />
                          )}
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="gap-2"
                          onClick={() => handleSelectProveedor(proveedor.id)}
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
            <Card className="p-6">
              <h2 className="text-xl font-semibold mb-4">Historial de Compras</h2>
              {comprasFiltradas.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No hay compras registradas
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Fecha Pedido</TableHead>
                        <TableHead>Cantidad</TableHead>
                        <TableHead>Precio Unit.</TableHead>
                        <TableHead>Total</TableHead>
                        <TableHead>Entrega Est.</TableHead>
                        <TableHead>Estado</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {comprasFiltradas.map((compra) => (
                        <TableRow key={compra.id}>
                          <TableCell>
                            {format(new Date(compra.fecha_pedido), "dd/MM/yyyy", { locale: es })}
                          </TableCell>
                          <TableCell>{compra.cantidad}</TableCell>
                          <TableCell>S/. {compra.precio_unitario.toFixed(2)}</TableCell>
                          <TableCell className="font-semibold">S/. {compra.total.toFixed(2)}</TableCell>
                          <TableCell>
                            {compra.fecha_entrega_estimada
                              ? format(new Date(compra.fecha_entrega_estimada), "dd/MM/yyyy", { locale: es })
                              : "-"}
                          </TableCell>
                          <TableCell>
                            <Badge variant={compra.estado === 'entregado' ? 'default' : 'secondary'}>
                              {compra.estado}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
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