import { useState, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Producto } from "@/hooks/useInventario"; // puedes migrar luego este tipo a /services/inventory
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";
import { uploadPublicFile } from "@/services/files";
import { listCategorias } from "@/services/inventory";

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producto: Omit<Producto, "id">) => void;
  producto?: Producto;
}

export const ProductoModal = ({ isOpen, onClose, onSave, producto }: ProductoModalProps) => {
  const { toast } = useToast();
  const [categorias, setCategorias] = useState<string[]>([]);
  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    stock: 0,
    precio_costo: 0,
    precio_venta: 0,
    categoria: "",
    estado: "Disponible",
    imagen_url: null as string | null,
  });

  useEffect(() => {
    // cargar categorías desde API
    (async () => {
      try {
        const cats = await listCategorias();
        setCategorias(cats.map((c) => c.toLowerCase().trim()).sort());
      } catch (e) {
        // si falla, no bloquea el modal
        console.error("categorías:", e);
      }
    })();
  }, []);

  useEffect(() => {
    if (producto) {
      setFormData({
        nombre: producto.nombre,
        codigo: producto.codigo,
        stock: producto.stock,
        precio_costo: producto.precio_costo,
        precio_venta: producto.precio_venta,
        categoria: producto.categoria,
        estado: (producto as any).estado ?? "Disponible",
        imagen_url: (producto as any).imagen_url ?? null,
      });
      setImagenPreview((producto as any).imagen_url ?? null);
    } else {
      setFormData({
        nombre: "",
        codigo: "",
        stock: 0,
        precio_costo: 0,
        precio_venta: 0,
        categoria: "",
        estado: "Disponible",
        imagen_url: null,
      });
      setImagenPreview(null);
    }
    setImagenFile(null);
    setMostrarNuevaCategoria(false);
    setNuevaCategoria("");
  }, [producto, isOpen]);

  function handleImagenChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setImagenFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setImagenPreview(reader.result as string);
    reader.readAsDataURL(file);
  }

  function agregarNuevaCategoria() {
    const categoriaLimpia = nuevaCategoria.toLowerCase().trim();
    if (!categoriaLimpia) return;
    if (!categorias.includes(categoriaLimpia)) {
      setCategorias((prev) => [...prev, categoriaLimpia].sort());
    }
    setFormData((f) => ({ ...f, categoria: categoriaLimpia }));
    setNuevaCategoria("");
    setMostrarNuevaCategoria(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.categoria) {
      toast({
        title: "Error",
        description: "Debes seleccionar o crear una categoría",
        variant: "destructive",
      });
      return;
    }
    if (formData.precio_venta < formData.precio_costo) {
      toast({
        title: "Revisa precios",
        description: "El precio de venta es menor que el costo.",
      });
    }

    let imagenUrl = formData.imagen_url ?? undefined;
    if (imagenFile) {
      try {
        const url = await uploadPublicFile(imagenFile);
        if (!url) {
          toast({
            title: "No se pudo subir la imagen",
            description: "Guardaremos el producto sin imagen.",
          });
        }
        imagenUrl = url ?? undefined;
      } catch {
        // ya notificado arriba
      }
    }

    const payload: Omit<Producto, "id"> = {
      nombre: formData.nombre.trim(),
      codigo: formData.codigo.trim(),
      stock: Number(formData.stock) || 0,
      precio_costo: Number(formData.precio_costo) || 0,
      precio_venta: Number(formData.precio_venta) || 0,
      categoria: formData.categoria.toLowerCase().trim(),
      estado: formData.estado as any,
      // @ts-ignore (tu tipo Producto quizá aún no tiene esta propiedad)
      imagen_url: imagenUrl ?? null,
    };

    onSave(payload);
    onClose();
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto ? "Editar Producto" : "Agregar Producto"}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagen */}
          <div className="space-y-2">
            <Label>Imagen del Producto (Opcional)</Label>
            <div className="flex items-center gap-4">
              {imagenPreview ? (
                <div className="relative">
                  <img
                    src={imagenPreview}
                    alt="Preview"
                    className="w-32 h-32 object-cover rounded-lg border"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-6 w-6"
                    onClick={() => {
                      setImagenPreview(null);
                      setImagenFile(null);
                      setFormData({ ...formData, imagen_url: null });
                    }}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <label className="cursor-pointer">
                  <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors">
                    <div className="text-center">
                      <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">Subir imagen</span>
                    </div>
                  </div>
                  <input type="file" accept="image/*" onChange={handleImagenChange} className="hidden" />
                </label>
              )}
            </div>
          </div>

          {/* Datos principales */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="codigo">Código</Label>
              <Input
                id="codigo"
                value={formData.codigo}
                onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock">Stock</Label>
              <Input
                id="stock"
                type="number"
                min="0"
                value={formData.stock}
                onChange={(e) =>
                  setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_costo">P. Costo</Label>
              <Input
                id="precio_costo"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_costo}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precio_costo: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="precio_venta">P. Venta</Label>
              <Input
                id="precio_venta"
                type="number"
                step="0.01"
                min="0"
                value={formData.precio_venta}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    precio_venta: parseFloat(e.target.value) || 0,
                  })
                }
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="categoria">Categoría *</Label>
              {!mostrarNuevaCategoria ? (
                <div className="flex gap-2">
                  <Select
                    value={formData.categoria}
                    onValueChange={(value) => {
                      if (value === "_nueva") setMostrarNuevaCategoria(true);
                      else setFormData({ ...formData, categoria: value });
                    }}
                  >
                    <SelectTrigger className="flex-1">
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categorias.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat.charAt(0).toUpperCase() + cat.slice(1)}
                        </SelectItem>
                      ))}
                      <SelectItem value="_nueva">+ Nueva Categoría</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              ) : (
                <div className="flex gap-2">
                  <Input
                    value={nuevaCategoria}
                    onChange={(e) => setNuevaCategoria(e.target.value)}
                    placeholder="Nueva categoría"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        agregarNuevaCategoria();
                      }
                    }}
                  />
                  <Button type="button" size="sm" onClick={agregarNuevaCategoria} disabled={!nuevaCategoria.trim()}>
                    ✓
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setMostrarNuevaCategoria(false);
                      setNuevaCategoria("");
                    }}
                  >
                    ✗
                  </Button>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="estado">Estado</Label>
              <Select
                value={formData.estado}
                onValueChange={(value) => setFormData({ ...formData, estado: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Disponible">Disponible</SelectItem>
                  <SelectItem value="Stock Bajo">Stock Bajo</SelectItem>
                  <SelectItem value="Stock Crítico">Stock Crítico</SelectItem>
                  <SelectItem value="Agotado">Agotado</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">{producto ? "Actualizar" : "Agregar"}</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
