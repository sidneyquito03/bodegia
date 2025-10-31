import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Producto } from "@/hooks/useInventario";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Upload, X } from "lucide-react";

interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producto: Omit<Producto, 'id'>) => void;
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
    nombre: '',
    codigo: '',
    stock: 0,
    precio_costo: 0,
    precio_venta: 0,
    categoria: '',
    estado: 'Disponible',
    imagen_url: null as string | null,
  });

  useEffect(() => {
    cargarCategorias();
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
        estado: producto.estado,
        imagen_url: (producto as any).imagen_url || null,
      });
      setImagenPreview((producto as any).imagen_url || null);
    } else {
      setFormData({
        nombre: '',
        codigo: '',
        stock: 0,
        precio_costo: 0,
        precio_venta: 0,
        categoria: '',
        estado: 'Disponible',
        imagen_url: null,
      });
      setImagenPreview(null);
    }
    setImagenFile(null);
    setMostrarNuevaCategoria(false);
    setNuevaCategoria("");
  }, [producto, isOpen]);

  const cargarCategorias = async () => {
    try {
      const { data, error } = await supabase
        .from('productos')
        .select('categoria');
      
      if (error) throw error;
      
      const categoriasUnicas = Array.from(
        new Set(data.map(p => p.categoria.toLowerCase().trim()))
      ).sort();
      
      setCategorias(categoriasUnicas);
    } catch (error) {
      console.error('Error cargando categorías:', error);
    }
  };

  const handleImagenChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImagenFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagenPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const subirImagen = async (file: File): Promise<string | null> => {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('productos-imagenes')
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage
        .from('productos-imagenes')
        .getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error) {
      console.error('Error subiendo imagen:', error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    }
  };

  const agregarNuevaCategoria = () => {
    const categoriaLimpia = nuevaCategoria.toLowerCase().trim();
    if (categoriaLimpia && !categorias.includes(categoriaLimpia)) {
      setCategorias([...categorias, categoriaLimpia].sort());
      setFormData({ ...formData, categoria: categoriaLimpia });
      setNuevaCategoria("");
      setMostrarNuevaCategoria(false);
    } else if (categorias.includes(categoriaLimpia)) {
      setFormData({ ...formData, categoria: categoriaLimpia });
      setNuevaCategoria("");
      setMostrarNuevaCategoria(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.categoria) {
      toast({
        title: "Error",
        description: "Debes seleccionar o crear una categoría",
        variant: "destructive",
      });
      return;
    }

    let imagenUrl = formData.imagen_url;
    
    if (imagenFile) {
      imagenUrl = await subirImagen(imagenFile);
    }

    const productoData = {
      ...formData,
      categoria: formData.categoria.toLowerCase().trim(),
      imagen_url: imagenUrl
    };

    onSave(productoData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{producto ? 'Editar Producto' : 'Agregar Producto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Imagen del producto */}
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
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImagenChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>
          </div>

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
                onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, precio_costo: parseFloat(e.target.value) || 0 })}
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
                onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) || 0 })}
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
                      if (value === "_nueva") {
                        setMostrarNuevaCategoria(true);
                      } else {
                        setFormData({ ...formData, categoria: value });
                      }
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
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        agregarNuevaCategoria();
                      }
                    }}
                  />
                  <Button
                    type="button"
                    size="sm"
                    onClick={agregarNuevaCategoria}
                    disabled={!nuevaCategoria.trim()}
                  >
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
              <Select value={formData.estado} onValueChange={(value) => setFormData({ ...formData, estado: value })}>
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
            <Button type="submit">
              {producto ? 'Actualizar' : 'Agregar'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
