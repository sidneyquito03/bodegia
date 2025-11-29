import { useState, useEffect } from "react";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../components/ui/select";
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
import { Plus, Trash2, TrendingDown, Package, DollarSign, Calendar, Search, Pencil } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import {
  listMermas,
  deleteMerma,
  getEstadisticasMermas,
  type Merma,
  type EstadisticasMermas,
  type TipoMerma,
} from "@/services/mermas";
import { RegistrarMermaModal } from "@/components/modals/RegistrarMermaModal";

const ControlMermas = () => {
  const [mermas, setMermas] = useState<Merma[]>([]);
  const [estadisticas, setEstadisticas] = useState<EstadisticasMermas | null>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [mermaToDelete, setMermaToDelete] = useState<string | null>(null);
  const [mermaToEdit, setMermaToEdit] = useState<Merma | null>(null);
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();

  const cargarDatos = async () => {
    try {
      setLoading(true);
      const params: any = {};
      if (filtroTipo !== "todos") params.tipo_merma = filtroTipo;
      if (fechaDesde) params.desde = fechaDesde;
      if (fechaHasta) params.hasta = fechaHasta;

      const [mermasData, statsData] = await Promise.all([
        listMermas(params),
        getEstadisticasMermas({ desde: fechaDesde, hasta: fechaHasta }),
      ]);

      setMermas(mermasData);
      setEstadisticas(statsData);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "No se pudieron cargar los datos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    cargarDatos();
  }, [filtroTipo, fechaDesde, fechaHasta]);

  const handleDeleteClick = (id: string) => {
    setMermaToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (mermaToDelete) {
      try {
        await deleteMerma(mermaToDelete);
        toast({
          title: "Merma eliminada",
          description: "El registro de merma ha sido eliminado y el stock restaurado",
        });
        cargarDatos();
      } catch (error: any) {
        toast({
          title: "Error",
          description: error?.message ?? "No se pudo eliminar la merma",
          variant: "destructive",
        });
      } finally {
        setMermaToDelete(null);
      }
    }
    setDeleteDialogOpen(false);
  };

  const getTipoMermaBadge = (tipo: TipoMerma) => {
    const coloresMerma: Record<TipoMerma, { label: string; className: string; bgColor: string }> = {
      vencido: { 
        label: "Vencido", 
        className: "bg-red-100 text-red-700 border-red-300",
        bgColor: "bg-red-500"
      },
      defectuoso: { 
        label: "Defectuoso", 
        className: "bg-yellow-100 text-yellow-700 border-yellow-300",
        bgColor: "bg-yellow-500"
      },
      robo: { 
        label: "Robo", 
        className: "bg-purple-100 text-purple-700 border-purple-300",
        bgColor: "bg-purple-500"
      },
      perdida: { 
        label: "Pérdida", 
        className: "bg-blue-100 text-blue-700 border-blue-300",
        bgColor: "bg-blue-500"
      },
      daño: { 
        label: "Daño", 
        className: "bg-orange-100 text-orange-700 border-orange-300",
        bgColor: "bg-orange-500"
      },
      otro: { 
        label: "Otro", 
        className: "bg-slate-100 text-slate-700 border-slate-300",
        bgColor: "bg-slate-500"
      },
      obsoleto: { 
        label: "Obsoleto", 
        className: "bg-gray-100 text-gray-700 border-gray-300",
        bgColor: "bg-gray-500"
      },
    };

    const tipoInfo = coloresMerma[tipo];
    return (
      <Badge
        variant="outline"
        className={tipoInfo.className}
      >
        {tipoInfo.label}
      </Badge>
    );
  };

  return (
    <>
      <div className="space-y-6">

        {/* Estadísticas */}
        {estadisticas && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <TrendingDown className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Total Registros</p>
                  <p className="text-2xl font-bold">
                    {estadisticas.totales.total_registros}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-warning/10 rounded-lg">
                  <Package className="h-6 w-6 text-warning" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Unidades Perdidas</p>
                  <p className="text-2xl font-bold">
                    {estadisticas.totales.total_unidades}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-destructive/10 rounded-lg">
                  <DollarSign className="h-6 w-6 text-destructive" />
                </div>
                <div>
                  <p className="text-sm text-muted-foreground">Pérdida Total</p>
                  <p className="text-2xl font-bold">
                    S/. {estadisticas.totales.total_perdida.toFixed(2)}
                  </p>
                </div>
              </div>
            </Card>

          </div>
        )}

        {/* Filtros y acciones */}
        <Card className="p-4 shadow-card">
          <div className="space-y-4">

            {/* Buscador */}
            <div className="relative w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por producto, código o motivo..."
                className="pl-10"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {/* Botón y filtros */}
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
              <Button 
                onClick={() => setModalOpen(true)} 
                className="gap-2 bg-gradient-primary text-white font-semibold shadow-lg hover:opacity-90"
              >
                <Plus className="h-4 w-4" />
                Registrar Merma
              </Button>

              <div className="flex flex-wrap gap-3 flex-1 justify-end">
                <Select value={filtroTipo} onValueChange={setFiltroTipo}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Tipo de merma" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todos">Todos los tipos</SelectItem>
                    <SelectItem value="vencido">Vencido</SelectItem>
                    <SelectItem value="defectuoso">Defectuoso</SelectItem>
                    <SelectItem value="robo">Robo</SelectItem>
                    <SelectItem value="perdida">Pérdida</SelectItem>
                    <SelectItem value="daño">Daño</SelectItem>
                    <SelectItem value="obsoleto">Obsoleto</SelectItem>
                    <SelectItem value="otro">Otro</SelectItem>
                  </SelectContent>
                </Select>

                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <Input type="date" value={fechaDesde} onChange={(e) => setFechaDesde(e.target.value)} className="w-[150px]" />
                  <span className="text-muted-foreground">-</span>
                  <Input type="date" value={fechaHasta} onChange={(e) => setFechaHasta(e.target.value)} className="w-[150px]" />
                </div>

              </div>
            </div>

          </div>
        </Card>
        {/* Tabla de mermas */}
        <Card className="shadow-card overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Producto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cantidad</TableHead>
                  <TableHead>Costo Unitario</TableHead>
                  <TableHead>Pérdida Total</TableHead>
                  <TableHead>Motivo</TableHead>
                  <TableHead>Registrado Por</TableHead>
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
                ) : mermas.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8">
                      No se encontraron registros de mermas
                    </TableCell>
                  </TableRow>
                ) : (
                  mermas
                    .filter((merma) => {
                      if (!searchTerm.trim()) return true;
                      const search = searchTerm.toLowerCase();
                      return (
                        merma.producto_nombre?.toLowerCase().includes(search) ||
                        merma.producto_codigo?.toLowerCase().includes(search) ||
                        merma.motivo?.toLowerCase().includes(search)
                      );
                    })
                    .map((merma) => (
                    <TableRow key={merma.id}>
                      <TableCell>
                        {new Date(merma.fecha_registro).toLocaleDateString("es-PE")}
                      </TableCell>
                      <TableCell className="font-medium">{merma.producto_nombre}</TableCell>
                      <TableCell className="text-muted-foreground">
                        {merma.producto_codigo}
                      </TableCell>
                      <TableCell>{getTipoMermaBadge(merma.tipo_merma)}</TableCell>
                      <TableCell>{merma.cantidad}</TableCell>
                      <TableCell>S/. {merma.costo_unitario.toFixed(2)}</TableCell>
                      <TableCell className="font-semibold text-destructive">
                        S/. {merma.costo_total.toFixed(2)}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate">
                        {merma.motivo || "-"}
                      </TableCell>
                      <TableCell>{merma.registrado_por}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-1">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-primary hover:text-primary"
                            onClick={() => {
                              setMermaToEdit(merma);
                              setModalOpen(true);
                            }}
                            title="Editar merma"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                            onClick={() => handleDeleteClick(merma.id)}
                            title="Eliminar y restaurar stock"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* GráfiGráfico por tipo */}
        {estadisticas && estadisticas.por_tipo.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pérdidas por Tipo</h3>
            <div className="space-y-3">
              {estadisticas.por_tipo.map((stat) => {
                const porcentaje =
                  (stat.perdida_total / estadisticas.totales.total_perdida) * 100;

                const coloresMerma = {
                  vencido: { bgColor: "bg-red-500" },
                  defectuoso: { bgColor: "bg-yellow-500" },
                  robo: { bgColor: "bg-purple-500" },
                  perdida: { bgColor: "bg-blue-500" },
                  daño: { bgColor: "bg-orange-500" },
                  obsoleto: { bgColor: "bg-gray-500" },
                  otro: { bgColor: "bg-slate-500" }
                };

                const colorClass = coloresMerma[stat.tipo_merma]?.bgColor || "bg-destructive";

                return (
                  <div key={stat.tipo_merma} className="space-y-1">
                    <div className="flex justify-between text-sm">
                      <span className="capitalize">{stat.tipo_merma}</span>
                      <span className="font-medium">
                        S/. {stat.perdida_total.toFixed(2)} ({porcentaje.toFixed(1)}%)
                      </span>
                    </div>

                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full ${colorClass} rounded-full transition-all`}
                        style={{ width: `${porcentaje}%` }}
                      />
                    </div>


   <p className="text-xs text-muted-foreground">
                      {stat.unidades_totales} unidades en {stat.cantidad_registros} registros
                    </p>
                  </div>
                );
              })}
            </div>
          </Card>
        )}
      </div>

      <RegistrarMermaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          setModalOpen(false);
          cargarDatos();
        }}
      />

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar registro de merma?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará el registro y restaurará el stock del producto. ¿Deseas continuar?
            </AlertDialogDescription>
          </AlertDialogHeader>

          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete}>Eliminar</AlertDialogAction>
          </AlertDialogFooter>

        </AlertDialogContent>
      </AlertDialog>

    </>
  );
};
export default ControlMermas;
