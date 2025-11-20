import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { createMerma, type TipoMerma } from "@/services/mermas";
import { listProductos, type Producto } from "@/services/inventory";

interface RegistrarMermaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const RegistrarMermaModal = ({
  isOpen,
  onClose,
  onSuccess,
}: RegistrarMermaModalProps) => {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [productos, setProductos] = useState<Producto[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [formData, setFormData] = useState({
    producto_id: "",
    tipo_merma: "vencido" as TipoMerma,
    cantidad: 1,
    motivo: "",
    registrado_por: "",
  });

  useEffect(() => {
    if (isOpen) {
      cargarProductos();
      setFormData({
        producto_id: "",
        tipo_merma: "vencido",
        cantidad: 1,
        motivo: "",
        registrado_por: "",
      });
      setSearchTerm("");
    }
  }, [isOpen]);

  const cargarProductos = async () => {
    try {
      const data = await listProductos();
      setProductos(data);
    } catch (error) {
      console.error("Error cargando productos:", error);
    }
  };

  const productosFiltrados = productos.filter(
    (p) =>
      p.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.codigo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const productoSeleccionado = productos.find((p) => p.id === formData.producto_id);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.producto_id) {
      toast({
        title: "Error",
        description: "Debes seleccionar un producto",
        variant: "destructive",
      });
      return;
    }

    if (!productoSeleccionado) {
      toast({
        title: "Error",
        description: "Producto no encontrado",
        variant: "destructive",
      });
      return;
    }

    if (formData.cantidad > productoSeleccionado.stock) {
      toast({
        title: "Stock insuficiente",
        description: `Solo hay ${productoSeleccionado.stock} unidades disponibles`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await createMerma({
        producto_id: formData.producto_id,
        tipo_merma: formData.tipo_merma,
        cantidad: formData.cantidad,
        motivo: formData.motivo || undefined,
        registrado_por: formData.registrado_por || undefined,
      });

      toast({
        title: "Merma registrada",
        description: "El registro de merma se creó correctamente y el stock fue actualizado",
      });

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "No se pudo registrar la merma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Merma</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Búsqueda de producto */}
          <div className="space-y-2">
            <Label>Buscar Producto</Label>
            <Input
              placeholder="Buscar por nombre o código..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Selección de producto */}
          <div className="space-y-2">
            <Label htmlFor="producto">Producto *</Label>
            <Select
              value={formData.producto_id}
              onValueChange={(value) => setFormData({ ...formData, producto_id: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar producto" />
              </SelectTrigger>
              <SelectContent>
                {productosFiltrados.length === 0 ? (
                  <div className="p-2 text-sm text-muted-foreground text-center">
                    No se encontraron productos
                  </div>
                ) : (
                  productosFiltrados.map((producto) => (
                    <SelectItem key={producto.id} value={producto.id}>
                      {producto.nombre} ({producto.codigo}) - Stock: {producto.stock}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
            {productoSeleccionado && (
              <p className="text-sm text-muted-foreground">
                Stock disponible: {productoSeleccionado.stock} unidades | Costo: S/.{" "}
                {productoSeleccionado.precio_costo.toFixed(2)}
              </p>
            )}
          </div>

          {/* Tipo de merma */}
          <div className="space-y-2">
            <Label htmlFor="tipo_merma">Tipo de Merma *</Label>
            <Select
              value={formData.tipo_merma}
              onValueChange={(value) =>
                setFormData({ ...formData, tipo_merma: value as TipoMerma })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="vencido">📅 Vencido (alimentos/perecibles)</SelectItem>
                <SelectItem value="defectuoso">⚠️ Defectuoso (llegó dañado)</SelectItem>
                <SelectItem value="daño">💥 Dañado (manipulación interna)</SelectItem>
                <SelectItem value="robo">🔒 Robo/Hurto</SelectItem>
                <SelectItem value="perdida">❓ Pérdida/Extravío</SelectItem>
                <SelectItem value="obsoleto">📦 Obsoleto/Descontinuado</SelectItem>
                <SelectItem value="otro">📝 Otro</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-xs text-muted-foreground">
              {formData.tipo_merma === "vencido" && "⚡ Típico de bodegas/alimentos"}
              {formData.tipo_merma === "defectuoso" && "⚡ Típico de ferreterías/tiendas"}
              {formData.tipo_merma === "daño" && "⚡ Producto dañado durante almacenamiento"}
              {formData.tipo_merma === "robo" && "⚡ Pérdida por sustracción"}
              {formData.tipo_merma === "obsoleto" && "⚡ Producto fuera de línea/tendencia"}
            </p>
          </div>

          {/* Cantidad */}
          <div className="space-y-2">
            <Label htmlFor="cantidad">Cantidad *</Label>
            <Input
              id="cantidad"
              type="number"
              min="1"
              max={productoSeleccionado?.stock ?? 9999}
              value={formData.cantidad}
              onChange={(e) =>
                setFormData({ ...formData, cantidad: parseInt(e.target.value) || 1 })
              }
              required
            />
            {productoSeleccionado && formData.cantidad > 0 && (
              <p className="text-sm text-muted-foreground">
                Pérdida total: S/.{" "}
                {(productoSeleccionado.precio_costo * formData.cantidad).toFixed(2)}
              </p>
            )}
          </div>

          {/* Motivo */}
          <div className="space-y-2">
            <Label htmlFor="motivo">Motivo (Opcional)</Label>
            <Textarea
              id="motivo"
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Descripción del motivo de la merma..."
              rows={3}
            />
          </div>

          {/* Registrado por */}
          <div className="space-y-2">
            <Label htmlFor="registrado_por">Registrado Por (Opcional)</Label>
            <Input
              id="registrado_por"
              value={formData.registrado_por}
              onChange={(e) => setFormData({ ...formData, registrado_por: e.target.value })}
              placeholder="Nombre del responsable"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? "Registrando..." : "Registrar Merma"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
