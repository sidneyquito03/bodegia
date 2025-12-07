import { useState, useMemo, useEffect } from "react";
import { Layout } from "../components/Layout";
import { Card, CardContent } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { ChatbotWidget } from "../components/ChatbotWidget";
import { ProductoModal } from "../components/modals/ProductoModal";
import { CargaMasivaModal } from "../components/modals/CargaMasivaModal";
import { HistorialPreciosModal } from "../components/modals/HistorialPreciosModal";
import { DetalleProductoModal } from "../components/modals/DetalleProductoModal";
import { Plus, Search, Pencil, Trash2, Upload, ChevronLeft, ChevronRight, History, Eye, AlertTriangle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "../components/ui/dialog";
import { useInventario, Producto } from "../hooks/useInventario";
import ControlMermas from "./ControlMermas";
import { ClasificacionesInventario, CLASIFICACIONES, obtenerClasificacionPorCategoria, obtenerCamposPersonalizados } from "../components/ClasificacionesInventario";

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
  const [detalleModalOpen, setDetalleModalOpen] = useState(false);
  const [productoDetalle, setProductoDetalle] = useState<Producto | null>(null);
  const [mermasViewOpen, setMermasViewOpen] = useState(false);
  const [clasificacionActiva, setClasificacionActiva] = useState<string>("abarrotes");
  const itemsPorPagina = 10;

  // Categorías filtradas por clasificación activa
  const categorias = useMemo(() => {
    if (!clasificacionActiva) {
      return Array.from(new Set(productos.map(p => p.categoria)));
    }
    
    const clasificacion = CLASIFICACIONES.find(c => c.id === clasificacionActiva);
    if (!clasificacion) {
      return Array.from(new Set(productos.map(p => p.categoria)));
    }
    
    // Filtrar productos que pertenecen a la clasificación activa
    const productosDeClasificacion = productos.filter(p => {
      const categoriaProducto = p.categoria.toLowerCase().trim();
      return clasificacion.categorias.some(cat => 
        categoriaProducto === cat.toLowerCase() || 
        categoriaProducto.includes(cat.toLowerCase()) || 
        cat.toLowerCase().includes(categoriaProducto)
      );
    });
    
    // Retornar solo las categorías únicas de esos productos
    return Array.from(new Set(productosDeClasificacion.map(p => p.categoria)));
  }, [productos, clasificacionActiva]);

  // Resetear filtro de categoría cuando cambie la clasificación
  useEffect(() => {
    setFiltroCategoria("todas");
    setCurrentPage(1);
  }, [clasificacionActiva]);

  const productosFiltradosYOrdenados = useMemo(() => {
    let resultado = productos.filter(p => {
      // Filtro por búsqueda
      const matchSearch = p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         p.codigo.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Filtro por categoría
      const matchCategoria = filtroCategoria === "todas" || p.categoria === filtroCategoria;
      
      // Filtro por estado
      const matchEstado = filtroEstado === "todos" || p.estado === filtroEstado;
      
      // Filtro por clasificación activa
      let matchClasificacion = true;
      if (clasificacionActiva) {
        const clasificacion = CLASIFICACIONES.find(c => c.id === clasificacionActiva);
        if (clasificacion) {
          // Verificar si la categoría del producto coincide con alguna categoría de la clasificación
          const categoriaProducto = p.categoria.toLowerCase().trim();
          matchClasificacion = clasificacion.categorias.some(cat => 
            categoriaProducto === cat.toLowerCase() || 
            categoriaProducto.includes(cat.toLowerCase()) || 
            cat.toLowerCase().includes(categoriaProducto)
          );
        }
      }
      
      return matchSearch && matchCategoria && matchEstado && matchClasificacion;
    });

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

  const getEstadoBadge = (estado: string, stock: number) => {
    switch (estado) {
      case "Disponible":
        return <Badge className="bg-green-500 text-white hover:bg-green-600">{estado}</Badge>;
      case "Stock Bajo":
        // Umbral FIJO: ≤7 = Rojo (urgente), ≤15 = Naranja (advertencia)
        if (stock <= 7) {
          return <Badge className="bg-red-500 text-white hover:bg-red-600">Stock Bajo (Urgente)</Badge>;
        } else {
          return <Badge className="bg-orange-500 text-white hover:bg-orange-600">Stock Bajo</Badge>;
        }
      case "Vencido":
        return <Badge variant="destructive">{estado}</Badge>;
      default:
        return <Badge variant="outline">{estado}</Badge>;
    }
  };

  const getDiasHastaVencimiento = (fecha_vencimiento?: string | null) => {
    if (!fecha_vencimiento) return null;
    const hoy = new Date();
    const vencimiento = new Date(fecha_vencimiento);
    const diffTime = vencimiento.getTime() - hoy.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground mt-1">Gestiona tus productos y stock</p>
          <p className="text-muted-foreground mt-1">Puedes agregar tus productos manualmente o mediante carga masiva.</p>
        </div>

        {/* Clasificaciones */}
        <Card className="p-4 shadow-card">
          <ClasificacionesInventario
            clasificacionActiva={clasificacionActiva}
            onSeleccionar={setClasificacionActiva}
          />
        </Card>

        {/* Toolbar */}
        <Card className="p-4 shadow-card">
          <CardContent>
          <div className="space-y-4">
            {/* Primera fila: Botones de acción y buscador */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    setEditingProducto(undefined);
                    setModalOpen(true);
                  }}
                  className="gap-2 bg-gradient-primary text-white font-semibold shadow-lg hover:opacity-90"
                >
                  <Plus className="h-4 w-4" />
                  Agregar Producto
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setCargaMasivaOpen(true)}
                  className="gap-2 border-teal-600 text-teal-600 hover:bg-teal-50"
                >
                  <Upload className="h-4 w-4" />
                  Carga Masiva
                </Button>
                <Button 
                  onClick={() => setMermasViewOpen(true)}
                  className="gap-2 bg-teal-600 hover:bg-teal-700 text-white"
                >
                  <AlertTriangle className="h-4 w-4" />
                  Ver Mermas
                </Button>
              </div>
              
              {/* Buscador */}
              <div className="relative w-full md:w-96">
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
                  <SelectItem value="Vencido">Vencido</SelectItem>
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
        </CardContent>
        </Card>

        {/* Table */}
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Imagen</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Marca</TableHead>
                  <TableHead>Stock</TableHead>
                  <TableHead>P. Venta</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead>Estado</TableHead>
                  
                  {/* Columna dinámica según clasificación */}
                  {clasificacionActiva ? (
                    (() => {
                      const config = obtenerCamposPersonalizados(clasificacionActiva);
                      
                      if (config.requiereFechaVencimiento) {
                        return <TableHead>Vencimiento</TableHead>;
                      } else if (clasificacionActiva === 'ropa' || clasificacionActiva === 'calzado') {
                        return <TableHead>Talla/Color</TableHead>;
                      } else if (clasificacionActiva === 'tecnologia') {
                        return <TableHead>Garantía</TableHead>;
                      } else if (clasificacionActiva === 'libreria') {
                        return <TableHead>Autor/Editorial</TableHead>;
                      } else if (clasificacionActiva === 'hogar' || clasificacionActiva === 'herramientas') {
                        return <TableHead>Material</TableHead>;
                      } else if (clasificacionActiva === 'belleza' || clasificacionActiva === 'aseo_personal') {
                        return <TableHead>Tono/Aroma</TableHead>;
                      } else {
                        return <TableHead>Detalles</TableHead>;
                      }
                    })()
                  ) : (
                    <TableHead>Info Adicional</TableHead>
                  )}
                  
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      Cargando...
                    </TableCell>
                  </TableRow>
                ) : productosPaginados.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No se encontraron productos
                    </TableCell>
                  </TableRow>
                ) : (
                  productosPaginados.map((producto) => {
                    const diasVencimiento = getDiasHastaVencimiento(producto.fecha_vencimiento);
                    return (
                      <TableRow key={producto.id}>
                        <TableCell>
                          {producto.imagen_url ? (
                            <img 
                              src={producto.imagen_url} 
                              alt={producto.nombre}
                              className="w-10 h-10 object-cover rounded"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/40?text=No+Img';
                              }}
                            />
                          ) : (
                            <div className="w-10 h-10 bg-gray-200 rounded flex items-center justify-center text-xs text-gray-400">
                              Sin img
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{producto.nombre}</TableCell>
                        <TableCell className="text-muted-foreground">{producto.codigo}</TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {producto.marca || '-'}
                        </TableCell>
                        <TableCell>
                          <span className={
                            producto.stock <= 7 
                              ? "font-bold text-red-600" 
                              : producto.stock <= 15 
                                ? "font-bold text-orange-600" 
                                : "font-semibold"
                          }>
                            {producto.stock}
                          </span>
                        </TableCell>
                        <TableCell>S/. {producto.precio_venta.toFixed(2)}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{producto.categoria}</Badge>
                        </TableCell>
                        <TableCell>{getEstadoBadge(producto.estado, producto.stock)}</TableCell>
                        
                        {/* Columna dinámica de detalles según clasificación */}
                        <TableCell>
                          {(() => {
                            // Si hay clasificación activa, mostrar campos específicos
                            if (clasificacionActiva) {
                              const config = obtenerCamposPersonalizados(clasificacionActiva);
                              
                              if (config.requiereFechaVencimiento) {
                                // Mostrar vencimiento para productos perecederos
                                if (diasVencimiento !== null) {
                                  if (diasVencimiento <= 0) {
                                    return <Badge variant="destructive" className="text-xs">Vencido</Badge>;
                                  } else if (diasVencimiento <= 7) {
                                    return <Badge className="bg-orange-500 text-white text-xs">⚠ {diasVencimiento}d</Badge>;
                                  } else if (diasVencimiento <= 30) {
                                    return <Badge className="bg-yellow-500 text-black text-xs">{diasVencimiento}d</Badge>;
                                  } else {
                                    return <span className="text-xs text-muted-foreground">{diasVencimiento}d</span>;
                                  }
                                }
                                return <span className="text-xs text-muted-foreground">-</span>;
                              } else {
                                // Mostrar campos relevantes para productos no perecederos
                                const productoExt = producto as any;
                                
                                if (clasificacionActiva === 'ropa' || clasificacionActiva === 'calzado') {
                                  return (
                                    <div className="text-xs space-y-0.5">
                                      {productoExt.talla && <div><span className="font-semibold">Talla:</span> {productoExt.talla}</div>}
                                      {productoExt.color && <div className="text-muted-foreground">{productoExt.color}</div>}
                                    </div>
                                  );
                                } else if (clasificacionActiva === 'tecnologia') {
                                  return (
                                    <div className="text-xs text-muted-foreground">
                                      {productoExt.garantia_dias ? `${productoExt.garantia_dias} días` : '-'}
                                    </div>
                                  );
                                } else if (clasificacionActiva === 'libreria') {
                                  return (
                                    <div className="text-xs space-y-0.5">
                                      {productoExt.autor && <div className="font-medium">{productoExt.autor}</div>}
                                      {productoExt.editorial && <div className="text-muted-foreground">{productoExt.editorial}</div>}
                                    </div>
                                  );
                                } else if (clasificacionActiva === 'herramientas' || clasificacionActiva === 'hogar') {
                                  return (
                                    <div className="text-xs text-muted-foreground">
                                      {productoExt.material || '-'}
                                    </div>
                                  );
                                } else if (clasificacionActiva === 'belleza' || clasificacionActiva === 'aseo_personal') {
                                  return (
                                    <div className="text-xs text-muted-foreground">
                                      {productoExt.tono_aroma || '-'}
                                    </div>
                                  );
                                } else if (clasificacionActiva === 'mascotas') {
                                  return (
                                    <div className="text-xs text-muted-foreground">
                                      {productoExt.tipo_mascota || '-'}
                                    </div>
                                  );
                                }
                                return <span className="text-xs text-muted-foreground">-</span>;
                              }
                            } else {
                              // Vista general: mostrar vencimiento si existe
                              if (diasVencimiento !== null) {
                                if (diasVencimiento <= 0) {
                                  return <Badge variant="destructive" className="text-xs">Vencido</Badge>;
                                } else if (diasVencimiento <= 7) {
                                  return <Badge className="bg-orange-500 text-white text-xs">⚠ {diasVencimiento}d</Badge>;
                                } else if (diasVencimiento <= 30) {
                                  return <Badge className="bg-yellow-500 text-black text-xs">{diasVencimiento}d</Badge>;
                                } else {
                                  return <span className="text-xs text-muted-foreground">{diasVencimiento}d</span>;
                                }
                              }
                              return <span className="text-xs text-muted-foreground">-</span>;
                            }
                          })()}
                        </TableCell>
                        
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => {
                                setProductoDetalle(producto);
                                setDetalleModalOpen(true);
                              }}
                              title="Ver detalles"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8"
                              onClick={() => handleEdit(producto)}
                              title="Editar"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="h-8 w-8 text-destructive hover:text-destructive"
                              onClick={() => handleDeleteClick(producto.id)}
                              title="Eliminar"
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
        clasificacionActiva={clasificacionActiva}
      />

      <CargaMasivaModal
        isOpen={cargaMasivaOpen}
        onClose={() => setCargaMasivaOpen(false)}
        onSuccess={() => {
          setCargaMasivaOpen(false);
        }}
      />

      {/* Modal/Vista de Mermas dentro de Inventario - SIN SIDEBAR */}
      {mermasViewOpen && (
        <Dialog open={mermasViewOpen} onOpenChange={setMermasViewOpen}>
          <DialogContent className="max-w-[95vw] w-full max-h-[95vh] overflow-y-auto p-0">
            {/* Header con badge de ubicación */}
            <div className="sticky top-0 z-10 bg-white border-b p-6 pb-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-teal-500 rounded-lg">
                    <AlertTriangle className="h-6 w-6 text-white" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold">Control de Mermas</h2>
                    <p className="text-sm text-muted-foreground">
                      Gestión y seguimiento de pérdidas, productos vencidos y defectuosos
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="px-3 py-1 bg-teal-500 text-white text-sm font-medium rounded-full border border-teal-300">
                    📦 Inventario
                  </span>
                </div>
              </div>
            </div>
            
            {/* Contenido de Mermas */}
            <div className="p-6 pt-2">
              <ControlMermas />
            </div>
          </DialogContent>
        </Dialog>
      )}

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

      <DetalleProductoModal
        isOpen={detalleModalOpen}
        onClose={() => {
          setDetalleModalOpen(false);
          setProductoDetalle(null);
        }}
        producto={productoDetalle}
      />

      <ChatbotWidget />
    </Layout>
  );
};

export default Inventario;
