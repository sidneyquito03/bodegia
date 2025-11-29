import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input} from "@/components/ui/input";
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
import { createMerma, updateMerma, type TipoMerma } from "@/services/mermas";
import { listProductos, type Producto } from "@/services/inventory";
import { Search, Package, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Sparkles } from "lucide-react";
import type { Merma } from "@/services/mermas";

interface RegistrarMermaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  mermaToEdit?: Merma | null;
}

export const RegistrarMermaModal = ({
  isOpen,
  onClose,
  onSuccess,
  mermaToEdit,
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
      
      if (mermaToEdit) {
        // Modo edición: cargar datos existentes
        setFormData({
          producto_id: mermaToEdit.producto_id,
          tipo_merma: mermaToEdit.tipo_merma,
          cantidad: mermaToEdit.cantidad,
          motivo: mermaToEdit.motivo || "",
          registrado_por: mermaToEdit.registrado_por || "",
        });
      } else {
        // Modo crear: limpiar formulario
        setFormData({
          producto_id: "",
          tipo_merma: "vencido",
          cantidad: 1,
          motivo: "",
          registrado_por: "",
        });
      }
      setSearchTerm("");
    }
  }, [isOpen, mermaToEdit]);

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
      if (mermaToEdit) {
        // Modo edición
        await updateMerma(mermaToEdit.id, {
          producto_id: formData.producto_id,
          tipo_merma: formData.tipo_merma,
          cantidad: formData.cantidad,
          motivo: formData.motivo || undefined,
          registrado_por: formData.registrado_por || undefined,
        });

        toast({
          title: "Merma actualizada",
          description: "El registro de merma se actualizó correctamente",
        });
      } else {
        // Modo crear
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
      }

      onSuccess();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error?.message ?? "No se pudo guardar la merma",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
   <Dialog open={isOpen} onOpenChange={onClose}>
  <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-none">

    <DialogHeader className="relative">
      <DialogTitle className="text-xl font-bold bg-clip-text text-teal-600 flex items-center gap-2">
        <Sparkles className="h-5 w-5 text-teal-600" />
        {mermaToEdit ? "Editar Merma" : "Registrar Merma"}
      </DialogTitle>

      <p className="text-sm text-muted-foreground mt-2">
        {mermaToEdit 
          ? "Modifica los datos de la merma registrada" 
          : "Registra productos dañados, vencidos o perdidos para actualizar el inventario"}
      </p>
    </DialogHeader>


        <form onSubmit={handleSubmit} className="space-y-7 overflow-y-auto flex-1 pr-2">
          <div className="space-y-3">
            <Label>Buscar y Seleccionar Producto *</Label>
            
       <div className="relative">
  <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
  <Input
    placeholder="Buscar por nombre, código o marca..."
    value={searchTerm}
    onChange={(e) => setSearchTerm(e.target.value)}
    className="pl-9 focus-visible:ring-teal-400"
  />
</div>


            {/* Cards de productos */}
            <div className="border rounded-lg max-h-[300px] overflow-y-auto bg-teal-50">
              {productosFiltrados.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground">
                  <Package className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">No se encontraron productos</p>
                  <p className="text-xs mt-1">Intenta con otro término de búsqueda</p>
                </div>
              ) : (
                <div className="p-2 space-y-2">
                  {productosFiltrados.slice(0, 50).map((producto) => (
                    <button
                      key={producto.id}
                      type="button"
                      onClick={() => setFormData({ ...formData, producto_id: producto.id })}
                      className={`w-full p-3 rounded-lg border-2 transition-all hover:border-teal-400 hover:bg-teal-50/50 ${
                        formData.producto_id === producto.id
                          ? "border-teal-600 bg-teal-50 ring-2 ring-teal-200"
                          : "border-border bg-background"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        {/* Imagen del producto */}
                        <div className="flex-shrink-0">
                          {(producto as any).imagen_url ? (
                            <img
                              src={(producto as any).imagen_url}
                              alt={producto.nombre}
                              className="w-12 h-12 object-cover rounded border"
                              onError={(e) => {
                                (e.target as HTMLImageElement).src = 'https://via.placeholder.com/48?text=Sin+Img';
                              }}
                            />
                          ) : (
                            <div className="w-12 h-12 bg-muted rounded border flex items-center justify-center">
                              <Package className="h-6 w-6 text-muted-foreground" />
                            </div>
                          )}
                        </div>

                        {/* Info del producto */}
                        <div className="flex-1 text-left min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <p className="font-semibold text-sm truncate">{producto.nombre}</p>
                            {formData.producto_id === producto.id && (
                              <Check className="h-4 w-4 text-teal-600 flex-shrink-0" />
                            )}
                          </div>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground flex-wrap">
                            <span className="font-mono">#{producto.codigo}</span>
                            {(producto as any).marca && (
                              <>
                                <span>•</span>
                                <span>{(producto as any).marca}</span>
                              </>
                            )}
                            <span>•</span>
                            <Badge 
                              variant="outline" 
                              className={`text-xs ${
                                producto.stock <= 7 
                                  ? "border-red-300 text-red-700 bg-red-50" 
                                  : producto.stock <= 15
                                  ? "border-orange-300 text-orange-700 bg-orange-50"
                                  : "border-green-300 text-green-700 bg-green-50"
                              }`}
                            >
                              Stock: {producto.stock}
                            </Badge>
                          </div>
                        </div>

                        {/* Precio */}
                        <div className="text-right flex-shrink-0">
                          <p className="text-xs text-muted-foreground">Costo</p>
                          <p className="font-semibold text-sm">S/. {producto.precio_costo.toFixed(2)}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                  {productosFiltrados.length > 50 && (
                    <p className="text-xs text-center text-muted-foreground p-2">
                      Mostrando los primeros 50 resultados. Usa el buscador para refinar.
                    </p>
                  )}
                </div>
              )}
            </div>

            {productoSeleccionado && (
              <div className="p-3 bg-teal-50 border border-teal-200 rounded-lg">
                <p className="text-sm font-medium text-teal-900">
                  ✅ Producto seleccionado: {productoSeleccionado.nombre}
                </p>
                <p className="text-xs text-teal-700 mt-1">
                  Stock disponible: {productoSeleccionado.stock} unidades | 
                  Costo unitario: S/. {productoSeleccionado.precio_costo.toFixed(2)}
                </p>
              </div>
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
              {formData.tipo_merma === "vencido" && " Típico de bodegas/alimentos"}
              {formData.tipo_merma === "defectuoso" && " Típico de ferreterías/tiendas"}
              {formData.tipo_merma === "daño" && " Producto dañado durante almacenamiento"}
              {formData.tipo_merma === "robo" && " Pérdida por sustracción"}
              {formData.tipo_merma === "obsoleto" && " Producto fuera de línea/tendencia"}
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
