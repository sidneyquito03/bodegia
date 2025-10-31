import { useState, useMemo } from "react";
import { Layout } from "@/components/Layout";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { ProductoModal } from "@/components/modals/ProductoModal";
import { CargaMasivaModal } from "@/components/modals/CargaMasivaModal";
import { HistorialPreciosModal } from "@/components/modals/HistorialPreciosModal";
import { Plus, Search, Pencil, Trash2, Upload, ChevronLeft, ChevronRight, History } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useInventario, Producto } from "@/hooks/useInventario";

const Inventario = () => {
  const { productos, loading, agregarProducto, actualizarProducto, eliminarProducto } = useInventario();
  const [modalOpen, setModalOpen] = useState(false);
  const [cargaMasivaOpen, setCargaMasivaOpen] = useState(false);
  const [editingProducto, setEditingProducto] = useState<Producto | undefined>();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [productoToDelete, setProductoToDelete] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filtroCategoria, setFiltroCategoria] = useState<string>("todas");
  const [filtroEstado, setFiltroEstado] = useState<string>("todos");
  const [ordenamiento, setOrdenamiento] = useState<string>("nombre-asc");
  const [historialModalOpen, setHistorialModalOpen] = useState(false);
  const [productoHistorial, setProductoHistorial] = useState<{id: string; nombre: string} | null>(null);
  const itemsPorPagina = 10;

  const categorias = useMemo(() => {
    return Array.from(new Set(productos.map(p => p.categoria)));
  }, [productos]);

  const productosFiltradosYOrdenados = useMemo(() => {
    let resultado = productos.filter(p =>
      (p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
       p.codigo.toLowerCase().includes(searchTerm.toLowerCase())) &&
      (filtroCategoria === "todas" || p.categoria === filtroCategoria) &&
      (filtroEstado === "todos" || p.estado === filtroEstado)
    );

    // Ordenamiento
    const [campo, direccion] = ordenamiento.split('-');
    resultado.sort((a, b) => {
      let valorA: any;
      let valorB: any;

      switch (campo) {
        case 'nombre':
          valorA = a.nombre.toLowerCase();
          valorB = b.nombre.toLowerCase();
          break;
        case 'stock':
          valorA = a.stock;
          valorB = b.stock;
          break;
        case 'precio_costo':
          valorA = a.precio_costo;
          valorB = b.precio_costo;
          break;
        case 'precio_venta':
          valorA = a.precio_venta;
          valorB = b.precio_venta;
          break;
        default:
          return 0;
      }

      if (valorA < valorB) return direccion === 'asc' ? -1 : 1;
      if (valorA > valorB) return direccion === 'asc' ? 1 : -1;
      return 0;
    });

    return resultado;
  }, [productos, searchTerm, filtroCategoria, filtroEstado, ordenamiento]);

  const totalPaginas = Math.ceil(productosFiltradosYOrdenados.length / itemsPorPagina);
  const productosPaginados = productosFiltradosYOrdenados.slice(
    (currentPage - 1) * itemsPorPagina,
    currentPage * itemsPorPagina
  );

  const handleEdit = (producto: Producto) => {
    setEditingProducto(producto);
    setModalOpen(true);
  };

  const handleSave = (producto: Omit<Producto, 'id'>) => {
    if (editingProducto) {
      actualizarProducto(editingProducto.id, producto);
    } else {
      agregarProducto(producto);
    }
    setEditingProducto(undefined);
  };

  const handleDeleteClick = (id: string) => {
    setProductoToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (productoToDelete) {
      eliminarProducto(productoToDelete);
      setProductoToDelete(null);
    }
    setDeleteDialogOpen(false);
  };

  const getEstadoBadge = (estado: string) => {
    switch (estado) {
      case "Disponible":
        return <Badge className="bg-success text-success-foreground">{estado}</Badge>;
      case "Stock Bajo":
        return <Badge variant="secondary">{estado}</Badge>;
      case "Stock Crítico":
        return <Badge variant="destructive">{estado}</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const handleStockChange = (id: string, newStock: number) => {
    if (newStock >= 0) {
      actualizarProducto(id, { stock: newStock });
    }
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus productos y stock</p>
        </div>

        {/* Toolbar */}
        <Card className="p-4 shadow-card">
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex flex-col sm:flex-row gap-2">
                <Button onClick={() => {
                  setEditingProducto(undefined);
                  setModalOpen(true);
                }} className="gap-2">
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCargaMasivaOpen(true)}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Carga Masiva
                </Button>
              </div>
              
              <div className="relative w-full md:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input 
                  placeholder="Buscar producto..." 
                  className="pl-10"
                  value={searchTerm}
                  onChange={(e) => {
                    setSearchTerm(e.target.value);
                    setCurrentPage(1);
                  }}
                />
              </div>
            </div>

            {/* Filtros */}
            <div className="flex flex-wrap gap-3">
              <Select value={filtroCategoria} onValueChange={(value) => {
                setFiltroCategoria(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todas las categorías" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todas">Todas las categorías</SelectItem>
                  {categorias.map((cat) => (
                    <SelectItem key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Select value={filtroEstado} onValueChange={(value) => {
                setFiltroEstado(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Todos los estados" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos los estados</SelectItem>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Stock Bajo">Stock Bajo</SelectItem>
                  <SelectItem value="Stock Crítico">Stock Crítico</SelectItem>
                </SelectContent>
              </Select>

              <Select value={ordenamiento} onValueChange={setOrdenamiento}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Ordenar por" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="nombre-asc">Nombre (A-Z)</SelectItem>
                  <SelectItem value="nombre-desc">Nombre (Z-A)</SelectItem>
                  <SelectItem value="stock-asc">Stock (Menor a Mayor)</SelectItem>
                  <SelectItem value="stock-desc">Stock (Mayor a Menor)</SelectItem>
                  <SelectItem value="precio_costo-asc">P. Costo (Menor a Mayor)</SelectItem>
                  <SelectItem value="precio_costo-desc">P. Costo (Mayor a Menor)</SelectItem>
                  <SelectItem value="precio_venta-asc">P. Venta (Menor a Mayor)</SelectItem>
                  <SelectItem value="precio_venta-desc">P. Venta (Mayor a Menor)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        {/* Table */}
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>P. Costo</TableHead>
                  <TableHead>P. Venta</TableHead>
                  <TableHead>Ganancia %</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : productosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  productosPaginados.map((producto) => {
                    const ganancia = ((producto.precio_venta - producto.precio_costo) / producto.precio_costo * 100);
                    return (
                      <TableRow key={producto.id}>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{producto.codigo}</TableCell>
                        <TableCell>
                          <Input 
                            type="number" 
                            value={producto.stock} 
                            onChange={(e) => handleStockChange(producto.id, parseInt(e.target.value) || 0)}
                            className="w-20 h-8"
                          />
                        </TableCell>
                        <TableCell>S/. {producto.precio_costo.toFixed(2)}</TableCell>
                        <TableCell>S/. {producto.precio_venta.toFixed(2)}</TableCell>
                        <TableCell className="text-success font-medium">
                          {ganancia.toFixed(1)}%
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{producto.categoria}</Badge>
                        </TableCell>
                        <TableCell>{getEstadoBadge(producto.estado)}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(producto)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(producto.id)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Paginación */}
        {totalPaginas > 1 && (
          <Card className="p-4 shadow-card">
            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Mostrando {((currentPage - 1) * itemsPorPagina) + 1} - {Math.min(currentPage * itemsPorPagina, productosFiltradosYOrdenados.length)} de {productosFiltradosYOrdenados.length} productos
              </p>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft className="h-4 w-4" />
                  Anterior
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: totalPaginas }, (_, i) => i + 1)
                    .filter(page => {
                      return page === 1 || 
                             page === totalPaginas || 
                             (page >= currentPage - 1 && page <= currentPage + 1);
                    })
                    .map((page, index, array) => (
                      <>
                        {index > 0 && array[index - 1] !== page - 1 && (
                          <span key={`ellipsis-${page}`} className="px-2">...</span>
                        )}
                        <Button
                          key={page}
                          variant={currentPage === page ? "default" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(page)}
                        >
                          {page}
                        </Button>
                      </>
                    ))}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setCurrentPage(p => Math.min(totalPaginas, p + 1))}
                  disabled={currentPage === totalPaginas}
                >
                  Siguiente
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        )}
      </div>

      <ProductoModal
        isOpen={modalOpen}
        onClose={() => {
          setModalOpen(false);
          setEditingProducto(undefined);
        }}
        onSave={handleSave}
        producto={editingProducto}
      />

      <CargaMasivaModal
        isOpen={cargaMasivaOpen}
        onClose={() => setCargaMasivaOpen(false)}
        onSuccess={() => {
          setCargaMasivaOpen(false);
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción no se puede deshacer. El producto será eliminado permanentemente.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <ChatbotWidget />
    </Layout>
  );
};

export default Inventario;
