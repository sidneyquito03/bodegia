import { useState, useEffect } from "react";
import { Layout } from "../components/Layout";
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
import { Plus, Trash2, TrendingDown, Package, DollarSign, Calendar } from "lucide-react";
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
  const [filtroTipo, setFiltroTipo] = useState<string>("todos");
  const [fechaDesde, setFechaDesde] = useState("");
  const [fechaHasta, setFechaHasta] = useState("");
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
    const config = {
      vencido: { label: "Vencido", variant: "destructive" as const },
      defectuoso: { label: "Defectuoso", variant: "secondary" as const },
      robo: { label: "Robo", variant: "destructive" as const },
      perdida: { label: "Pérdida", variant: "secondary" as const },
      daño: { label: "Daño", variant: "secondary" as const },
      otro: { label: "Otro", variant: "outline" as const },
    };
    const { label, variant } = config[tipo];
    return <Badge variant={variant}>{label}</Badge>;
  };

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-bold">Control de Mermas</h1>
          <p className="text-muted-foreground mt-1">
            Gestión y seguimiento de pérdidas, productos vencidos y defectuosos
          </p>
        </div>

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
                  <p className="text-2xl font-bold">{estadisticas.totales.total_registros}</p>
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
                  <p className="text-2xl font-bold">{estadisticas.totales.total_unidades}</p>
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
          <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
            <Button onClick={() => setModalOpen(true)} className="gap-2">
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
                  <SelectItem value="otro">Otro</SelectItem>
                </SelectContent>
              </Select>

              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <Input
                  type="date"
                  value={fechaDesde}
                  onChange={(e) => setFechaDesde(e.target.value)}
                  className="w-[150px]"
                  placeholder="Desde"
                />
                <span className="text-muted-foreground">-</span>
                <Input
                  type="date"
                  value={fechaHasta}
                  onChange={(e) => setFechaHasta(e.target.value)}
                  className="w-[150px]"
                  placeholder="Hasta"
                />
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
                  mermas.map((merma) => (
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
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => handleDeleteClick(merma.id)}
                          title="Eliminar y restaurar stock"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </Card>

        {/* Gráfico por tipo de merma */}
        {estadisticas && estadisticas.por_tipo.length > 0 && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">Pérdidas por Tipo</h3>
            <div className="space-y-3">
              {estadisticas.por_tipo.map((stat) => {
                const porcentaje =
                  (stat.perdida_total / estadisticas.totales.total_perdida) * 100;
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
                        className="h-full bg-destructive rounded-full transition-all"
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
    </Layout>
  );
};

export default ControlMermas;
