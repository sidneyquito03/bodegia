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
import { useToast } from "@/hooks/use-toast";
import { Upload, X, Sparkles, Info } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import { Producto } from "@/hooks/useInventario"; 
import { uploadPublicFile } from "@/services/files";
import { listCategorias } from "@/services/inventory";
import { listProveedores } from "@/services/providers";
import { obtenerCamposPersonalizados, CLASIFICACIONES } from "@/components/ClasificacionesInventario";

export interface ProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (producto: Omit<Producto, "id">) => void;
  producto?: Producto;
  clasificacionActiva?: string | null;
}

export const ProductoModal = ({ isOpen, onClose, onSave, producto, clasificacionActiva }: ProductoModalProps) => {
  const { toast } = useToast();

  const camposPersonalizados = clasificacionActiva
    ? obtenerCamposPersonalizados(clasificacionActiva)
    : { requiereFechaVencimiento: false, camposObligatorios: [], camposOpcionales: [] };

  const [categorias, setCategorias] = useState<string[]>([]);
  const [proveedores, setProveedores] = useState<{ id: string; nombre: string; activo: boolean }[]>([]);

  const [nuevaCategoria, setNuevaCategoria] = useState("");
  const [mostrarNuevaCategoria, setMostrarNuevaCategoria] = useState(false);

  const [imagenFile, setImagenFile] = useState<File | null>(null);
  const [imagenPreview, setImagenPreview] = useState<string | null>(null);
  const [imagenUrlInput, setImagenUrlInput] = useState<string>("");

  const [formData, setFormData] = useState({
    nombre: "",
    codigo: "",
    stock: 0,
    precio_costo: 0,
    precio_venta: 0,
    categoria: "",
    estado: "Disponible" as Producto["estado"],
    imagen_url: null as string | null,

    // campos básicos extendidos
    proveedor_id: null as string | null,
    fecha_vencimiento: null as string | null,
    marca: null as string | null,
    medida_peso: null as string | null,
    stock_bajo: 10,

    // campos adicionales generales
    ubicacion_almacen: null as string | null,
    lote_numero: null as string | null,
    codigo_barras_adicional: null as string | null,
    unidad_medida: null as string | null,
    es_perecedero: false,
    requiere_refrigeracion: false,
    temperatura_almacenamiento: null as string | null,
    dias_vida_util: null as number | null,
    es_fraccionable: false,
    peso_unitario: null as number | null,
    volumen_unitario: null as number | null,
    alto_cm: null as number | null,
    ancho_cm: null as number | null,
    profundo_cm: null as number | null,
    color: null as string | null,
    talla: null as string | null,
    material: null as string | null,
    garantia_dias: null as number | null,
    notas_internas: null as string | null,

    // campos específicos por clasificación
    genero: null as string | null,
    tipo_tela: null as string | null,
    tipo_mascota: null as string | null,
    tono_aroma: null as string | null,
    tipo_piel_cabello: null as string | null,
    autor: null as string | null,
    editorial: null as string | null,
    isbn_ean: null as string | null,
    formato_libro: null as string | null,
    numero_paginas: null as number | null,
    especificacion_electrica: null as string | null,
    detalles_clave: null as string | null,
    volumen_peso_neto: null as string | null,
  });

  // cargar categorías y proveedores
  useEffect(() => {
    (async () => {
      try {
        const cats = await listCategorias();
        setCategorias(cats.map((c) => c.toLowerCase().trim()).sort());
      } catch (e) {
        console.error("categorías:", e);
      }
      try {
        const provs = await listProveedores();
        setProveedores(provs.filter(p => p.activo));
      } catch (e) {
        console.error("proveedores:", e);
      }
    })();
  }, []);

  // hidratar form cuando llega producto o al abrir modal
  useEffect(() => {
    // Solo ejecutar cuando el modal está abierto
    if (!isOpen) {
      return;
    }
    
    if (producto) {
      // Modo edición - hidratar con datos del producto
      const productoExtendido = producto as any;
      setFormData({
        nombre: producto.nombre,
        codigo: producto.codigo,
        stock: producto.stock,
        precio_costo: producto.precio_costo,
        precio_venta: producto.precio_venta,
        categoria: producto.categoria,
        estado: producto.estado,
        imagen_url: productoExtendido.imagen_url ?? null,
        proveedor_id: productoExtendido.proveedor_id ?? null,
        fecha_vencimiento: productoExtendido.fecha_vencimiento ?? null,
        marca: productoExtendido.marca ?? null,
        medida_peso: productoExtendido.medida_peso ?? null,
        stock_bajo: productoExtendido.stock_bajo ?? 10,
        ubicacion_almacen: productoExtendido.ubicacion_almacen ?? null,
        lote_numero: productoExtendido.lote_numero ?? null,
        codigo_barras_adicional: productoExtendido.codigo_barras_adicional ?? null,
        unidad_medida: productoExtendido.unidad_medida ?? null,
        es_perecedero: productoExtendido.es_perecedero ?? false,
        requiere_refrigeracion: productoExtendido.requiere_refrigeracion ?? false,
        temperatura_almacenamiento: productoExtendido.temperatura_almacenamiento ?? null,
        dias_vida_util: productoExtendido.dias_vida_util ?? null,
        es_fraccionable: productoExtendido.es_fraccionable ?? false,
        peso_unitario: productoExtendido.peso_unitario ?? null,
        volumen_unitario: productoExtendido.volumen_unitario ?? null,
        alto_cm: productoExtendido.alto_cm ?? null,
        ancho_cm: productoExtendido.ancho_cm ?? null,
        profundo_cm: productoExtendido.profundo_cm ?? null,
        color: productoExtendido.color ?? null,
        talla: productoExtendido.talla ?? null,
        material: productoExtendido.material ?? null,
        garantia_dias: productoExtendido.garantia_dias ?? null,
        notas_internas: productoExtendido.notas_internas ?? null,
        genero: productoExtendido.genero ?? null,
        tipo_tela: productoExtendido.tipo_tela ?? null,
        tipo_mascota: productoExtendido.tipo_mascota ?? null,
        tono_aroma: productoExtendido.tono_aroma ?? null,
        tipo_piel_cabello: productoExtendido.tipo_piel_cabello ?? null,
        autor: productoExtendido.autor ?? null,
        editorial: productoExtendido.editorial ?? null,
        isbn_ean: productoExtendido.isbn_ean ?? null,
        formato_libro: productoExtendido.formato_libro ?? null,
        numero_paginas: productoExtendido.numero_paginas ?? null,
        especificacion_electrica: productoExtendido.especificacion_electrica ?? null,
        detalles_clave: productoExtendido.detalles_clave ?? null,
        volumen_peso_neto: productoExtendido.volumen_peso_neto ?? null,
      });
      setImagenPreview(productoExtendido.imagen_url ?? null);
      setImagenUrlInput(productoExtendido.imagen_url ?? "");
      setImagenFile(null);
    } else {
      // Modo agregar - resetear formulario
      setFormData({
        nombre: "",
        codigo: "",
        stock: 0,
        precio_costo: 0,
        precio_venta: 0,
        categoria: "",
        estado: "Disponible",
        imagen_url: null,
        proveedor_id: null,
        fecha_vencimiento: null,
        marca: null,
        medida_peso: null,
        stock_bajo: 10,
        ubicacion_almacen: null,
        lote_numero: null,
        codigo_barras_adicional: null,
        unidad_medida: null,
        es_perecedero: false,
        requiere_refrigeracion: false,
        temperatura_almacenamiento: null,
        dias_vida_util: null,
        es_fraccionable: false,
        peso_unitario: null,
        volumen_unitario: null,
        alto_cm: null,
        ancho_cm: null,
        profundo_cm: null,
        color: null,
        talla: null,
        material: null,
        garantia_dias: null,
        notas_internas: null,
        genero: null,
        tipo_tela: null,
        tipo_mascota: null,
        tono_aroma: null,
        tipo_piel_cabello: null,
        autor: null,
        editorial: null,
        isbn_ean: null,
        formato_libro: null,
        numero_paginas: null,
        especificacion_electrica: null,
        detalles_clave: null,
        volumen_peso_neto: null,
      });
      setImagenPreview(null);
      setImagenUrlInput("");
      setImagenFile(null);
    }
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
    // Si hay URL en el input, usarla directamente
    if (imagenUrlInput && imagenUrlInput.trim()) {
      imagenUrl = imagenUrlInput.trim();
    } else if (imagenFile) {
      // Si hay archivo, subirlo
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
        toast({
          title: "Error al subir imagen",
          description: "Guardaremos el producto sin imagen.",
          variant: "destructive",
        });
      }
    }

    // Normalizamos/parseamos - no enviamos estado porque se calcula en el backend
    const payload: Omit<Producto, "id" | "estado" | "created_at" | "updated_at"> = {
      nombre: formData.nombre.trim(),
      codigo: formData.codigo.trim(),
      stock: Number(formData.stock) || 0,
      precio_costo: Number(formData.precio_costo) || 0,
      precio_venta: Number(formData.precio_venta) || 0,
      categoria: formData.categoria.toLowerCase().trim(),
      imagen_url: imagenUrl ?? null,

      proveedor_id: formData.proveedor_id || null,
      fecha_vencimiento: formData.fecha_vencimiento || null,
      marca: formData.marca?.trim() || null,
      medida_peso: formData.medida_peso?.trim() || null,
      stock_bajo: Number(formData.stock_bajo) || 10,

      // campos adicionales
      ubicacion_almacen: formData.ubicacion_almacen?.trim() || null,
      lote_numero: formData.lote_numero?.trim() || null,
      codigo_barras_adicional: formData.codigo_barras_adicional?.trim() || null,
      unidad_medida: formData.unidad_medida?.trim() || null,
      es_perecedero: formData.es_perecedero || false,
      requiere_refrigeracion: formData.requiere_refrigeracion || false,
      temperatura_almacenamiento: formData.temperatura_almacenamiento?.trim() || null,
      dias_vida_util: formData.dias_vida_util ? Number(formData.dias_vida_util) : null,
      es_fraccionable: formData.es_fraccionable || false,
      peso_unitario: formData.peso_unitario ? Number(formData.peso_unitario) : null,
      volumen_unitario: formData.volumen_unitario ? Number(formData.volumen_unitario) : null,
      alto_cm: formData.alto_cm ? Number(formData.alto_cm) : null,
      ancho_cm: formData.ancho_cm ? Number(formData.ancho_cm) : null,
      profundo_cm: formData.profundo_cm ? Number(formData.profundo_cm) : null,
      color: formData.color?.trim() || null,
      talla: formData.talla?.trim() || null,
      material: formData.material?.trim() || null,
      garantia_dias: formData.garantia_dias ? Number(formData.garantia_dias) : null,
      notas_internas: formData.notas_internas?.trim() || null,

      // campos específicos por clasificación
      genero: formData.genero?.trim() || null,
      tipo_tela: formData.tipo_tela?.trim() || null,
      tipo_mascota: formData.tipo_mascota?.trim() || null,
      tono_aroma: formData.tono_aroma?.trim() || null,
      tipo_piel_cabello: formData.tipo_piel_cabello?.trim() || null,
      autor: formData.autor?.trim() || null,
      editorial: formData.editorial?.trim() || null,
      isbn_ean: formData.isbn_ean?.trim() || null,
      formato_libro: formData.formato_libro?.trim() || null,
      numero_paginas: formData.numero_paginas ? Number(formData.numero_paginas) : null,
      especificacion_electrica: formData.especificacion_electrica?.trim() || null,
      detalles_clave: formData.detalles_clave?.trim() || null,
      volumen_peso_neto: formData.volumen_peso_neto?.trim() || null,
    };

    onSave(payload as any);
    onClose();
  }

  return (
  <Dialog open={isOpen} onOpenChange={() => onClose()}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto border-none">
        <DialogHeader className="relative">
          <DialogTitle className="text-xl font-bold bg-clip-text text-teal-600 flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-teal-600" />
            {producto ? "Editar Producto" : "Agregar Nuevo Producto"}
          </DialogTitle>
          <p className="text-sm text-muted-foreground mt-2">
            {producto ? "Actualiza la información de tu producto" : "Completa los datos para agregar un producto al inventario"}
          </p>
          
          {/* Indicador de clasificación */}
          {clasificacionActiva && (
            <div className="mt-3 flex items-center gap-2">
              <Badge variant="outline" className={`${CLASIFICACIONES.find(c => c.id === clasificacionActiva)?.color || 'bg-gray-400'} text-white border-none px-3 py-1`}>
                <Info className="h-3 w-3 mr-1" />
                Clasificación: {CLASIFICACIONES.find(c => c.id === clasificacionActiva)?.nombre || clasificacionActiva}
              </Badge>
            </div>
          )}
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-2">
          {/* Imagen - Opción 1: Subir archivo */}
          <div className="space-y-2 p-4 bg-gradient-to-br from-teal-10 to-emerald-50 rounded-lg border border-teal-400">
            <Label className="text-sm font-semibold text-teal-800">Imagen del Producto (Subir archivo)</Label>
            <div className="flex items-center gap-4">
              {imagenPreview && !imagenUrlInput ? (
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
                  <div className="w-32 h-32 m-2 border-2 border-dashed rounded-lg flex items-center justify-center hover:bg-muted/50 transition-colors">
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

          {/* Imagen - Opción 2: URL externa */}
          <div className="space-y-2 bg-white p-4 rounded-lg border border-gray-200">
            <Label htmlFor="imagen_url" className="text-sm font-medium">O pega URL de imagen externa</Label>
            <div className="flex gap-2 items-start">
              <div className="flex-1 space-y-2">
                <Input
                  id="imagen_url"
                  value={imagenUrlInput}
                  onChange={(e) => {
                    setImagenUrlInput(e.target.value);
                    setFormData({ ...formData, imagen_url: e.target.value || null });
                    if (e.target.value) {
                      setImagenPreview(e.target.value);
                      setImagenFile(null);
                    }
                  }}
                  placeholder="https://ejemplo.com/imagen.jpg"
                  className="border-gray-300"
                />
              </div>
              {imagenUrlInput && (
                <div className="relative">
                  <img
                    src={imagenUrlInput}
                    alt="Preview URL"
                    className="w-20 h-20 object-cover rounded border"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://via.placeholder.com/80?text=Error';
                    }}
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute -top-2 -right-2 h-5 w-5"
                    onClick={() => {
                      setImagenUrlInput("");
                      setFormData({ ...formData, imagen_url: null });
                      setImagenPreview(null);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          {}
          <div className="space-y-4 bg-gradient-to-r from-teal-50 to-emerald-100 p-4 rounded-lg border border-teal-0">
            <h3 className="text-sm font-semibold text-teal-600 flex items-center gap-2">
              <div className="h-1 w-1 rounded-full bg-teal-500"></div>
              Información Básica
            </h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="nombre" className="text-sm font-medium">Nombre *</Label>
                <Input
                  id="nombre"
                  value={formData.nombre}
                  onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="codigo" className="text-sm font-medium">Código *</Label>
                <Input
                  id="codigo"
                  value={formData.codigo}
                  onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                  required
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="stock" className="text-sm font-medium">Stock *</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData({ ...formData, stock: parseInt(e.target.value) || 0 })}
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_costo" className="text-sm font-medium">P. Costo *</Label>
                <Input
                  id="precio_costo"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_costo}
                  onChange={(e) => setFormData({ ...formData, precio_costo: parseFloat(e.target.value) || 0 })}
                  required
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="precio_venta" className="text-sm font-medium">P. Venta *</Label>
                <Input
                  id="precio_venta"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.precio_venta}
                  onChange={(e) => setFormData({ ...formData, precio_venta: parseFloat(e.target.value) || 0 })}
                  required
                  className="border-gray-300"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="marca" className="text-sm font-medium">Marca</Label>
                <Input
                  id="marca"
                  value={formData.marca || ""}
                  onChange={(e) => setFormData({ ...formData, marca: e.target.value || null })}
                  placeholder="Ej: Gloria, Samsung, Nike"
                  className="border-gray-300"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="proveedor" className="text-sm font-medium">Proveedor</Label>
                <Select
                  value={formData.proveedor_id ?? ""}
                  onValueChange={(value) => setFormData({ ...formData, proveedor_id: value || null })}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Seleccionar proveedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin proveedor</SelectItem>
                    {proveedores.filter(p => p.activo).map((prov) => (
                      <SelectItem key={prov.id} value={prov.id}>
                        {prov.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="categoria" className="text-sm font-medium">Categoría *</Label>
                <Select
                  value={mostrarNuevaCategoria ? "__nueva__" : formData.categoria}
                  onValueChange={(value) => {
                    if (value === "__nueva__") {
                      setMostrarNuevaCategoria(true);
                    } else {
                      setFormData({ ...formData, categoria: value });
                      setMostrarNuevaCategoria(false);
                    }
                  }}
                >
                  <SelectTrigger className="border-gray-300">
                    <SelectValue placeholder="Selecciona categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    {categorias.map((cat) => (
                      <SelectItem key={cat} value={cat}>
                        {cat.charAt(0).toUpperCase() + cat.slice(1)}
                      </SelectItem>
                    ))}
                    <SelectItem value="__nueva__">+ Nueva Categoría</SelectItem>
                  </SelectContent>
                </Select>
                
                {mostrarNuevaCategoria && (
                  <div className="flex gap-2 items-center mt-2">
                    <Input
                      value={nuevaCategoria}
                      onChange={(e) => setNuevaCategoria(e.target.value)}
                      placeholder="Nombre de la nueva categoría"
                      className="border-gray-300"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          agregarNuevaCategoria();
                        }
                      }}
                    />
                    <Button type="button" onClick={agregarNuevaCategoria} size="sm">
                      Añadir
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setMostrarNuevaCategoria(false);
                        setNuevaCategoria("");
                      }}
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="stock_bajo" className="text-sm font-medium">
                  Stock Bajo
                </Label>
                <Input
                  id="stock_bajo"
                  type="number"
                  min="0"
                  value={formData.stock_bajo}
                  onChange={(e) => setFormData({ ...formData, stock_bajo: parseInt(e.target.value) || 10 })}
                  className="border-gray-300"
                />
                <p className="text-xs text-muted-foreground">
                  Puedes seleccionar desde que nivel de stock se considera "bajo" para este producto.
                </p>
              </div>
            </div>
          </div>

          {/* Sección: Campos Específicos por Clasificación */}
          {clasificacionActiva && (camposPersonalizados.camposObligatorios.length > 0 || camposPersonalizados.camposOpcionales.length > 0 || camposPersonalizados.requiereFechaVencimiento) && (
            <div className="space-y-4 bg-gradient-to-r from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-200">
              <h3 className="text-sm font-semibold text-teal-700 flex items-center gap-2">
                <div className="h-1 w-1 rounded-full bg-blue-600"></div>
                Campos Específicos - {CLASIFICACIONES.find(c => c.id === clasificacionActiva)?.nombre}
              </h3>

              {/* Fecha de Vencimiento si es requerido */}
              {camposPersonalizados.requiereFechaVencimiento && (
                <div className="space-y-2">
                  <Label htmlFor="fecha_vencimiento" className="text-sm font-medium text-emerald-500">
                    Fecha de Vencimiento *
                  </Label>
                  <Input
                    id="fecha_vencimiento"
                    type="date"
                    value={formData.fecha_vencimiento ?? ""}
                    onChange={(e) => setFormData({ ...formData, fecha_vencimiento: e.target.value || null })}
                    required
                    className="border-gray-300"
                  />
                </div>
              )}

              {/* Campos Obligatorios */}
              {camposPersonalizados.camposObligatorios.map((campo: any) => (
                <div key={campo.nombre} className="space-y-2">
                  <Label htmlFor={campo.nombre} className="text-sm font-medium text-emerald-500">
                    {campo.nombre === 'volumen_peso_neto' ? 'Volumen/Peso Neto' :
                     campo.nombre === 'genero' ? 'Género' :
                     campo.nombre === 'tipo_mascota' ? 'Tipo de Mascota' :
                     campo.nombre === 'tono_aroma' ? 'Tono o Aroma' :
                     campo.nombre === 'autor' ? 'Autor' :
                     campo.nombre === 'editorial' ? 'Editorial' :
                     campo.nombre === 'talla' ? 'Talla' :
                     campo.nombre === 'color' ? 'Color' :
                     campo.nombre === 'garantia_dias' ? 'Garantía (días)' :
                     campo.nombre} *
                  </Label>
                  
                  {campo.tipo === 'select' && campo.opciones ? (
                    <Select
                      value={(formData as any)[campo.nombre] ?? ""}
                      onValueChange={(value) => setFormData({ ...formData, [campo.nombre]: value || null })}
                    >
                      <SelectTrigger className="border-gray-300">
                        <SelectValue placeholder={`Seleccionar ${campo.nombre}`} />
                      </SelectTrigger>
                      <SelectContent>
                        {campo.opciones.map((opcion: string) => (
                          <SelectItem key={opcion} value={opcion}>
                            {opcion}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : campo.tipo === 'number' ? (
                    <Input
                      id={campo.nombre}
                      type="number"
                      min="0"
                      value={(formData as any)[campo.nombre] || ""}
                      onChange={(e) => setFormData({ ...formData, [campo.nombre]: e.target.value ? parseInt(e.target.value) : null })}
                      placeholder={campo.placeholder}
                      required
                      className="border-gray-300"
                    />
                  ) : (
                    <Input
                      id={campo.nombre}
                      type="text"
                      value={(formData as any)[campo.nombre] || ""}
                      onChange={(e) => setFormData({ ...formData, [campo.nombre]: e.target.value || null })}
                      placeholder={campo.placeholder}
                      required
                      className="border-gray-300"
                    />
                  )}
                </div>
              ))}

              {/* Campos Opcionales */}
              {camposPersonalizados.camposOpcionales.length > 0 && (
                <div className="space-y-3 pt-2 border-t border-blue-200">
                  <p className="text-xs font-medium text-teal-700">Campos Opcionales</p>
                  {camposPersonalizados.camposOpcionales.map((campo: any) => (
                    <div key={campo.nombre} className="space-y-2">
                      <Label htmlFor={campo.nombre} className="text-sm font-medium text-emerald-500">
                        {campo.nombre === 'garantia_dias' ? 'Garantía (días)' :
                         campo.nombre === 'detalles_clave' ? 'Detalles Clave' :
                         campo.nombre === 'material' ? 'Material' :
                         campo.nombre === 'alto_cm' ? 'Alto (cm)' :
                         campo.nombre === 'ancho_cm' ? 'Ancho (cm)' :
                         campo.nombre === 'profundo_cm' ? 'Profundidad (cm)' :
                         campo.nombre === 'especificacion_electrica' ? 'Especificación Eléctrica' :
                         campo.nombre === 'color' ? 'Color' :
                         campo.nombre === 'tipo_piel_cabello' ? 'Tipo de Piel/Cabello' :
                         campo.nombre === 'isbn_ean' ? 'ISBN/EAN' :
                         campo.nombre === 'formato_libro' ? 'Formato' :
                         campo.nombre === 'numero_paginas' ? 'Número de Páginas' :
                         campo.nombre}
                      </Label>
                      
                      {campo.tipo === 'select' && campo.opciones ? (
                        <Select
                          value={(formData as any)[campo.nombre] ?? ""}
                          onValueChange={(value) => setFormData({ ...formData, [campo.nombre]: value || null })}
                        >
                          <SelectTrigger className="border-gray-300">
                            <SelectValue placeholder={`Seleccionar ${campo.nombre}`} />
                          </SelectTrigger>
                          <SelectContent>
                            {campo.opciones.map((opcion: string) => (
                              <SelectItem key={opcion} value={opcion}>
                                {opcion}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : campo.tipo === 'textarea' ? (
                        <Textarea
                          id={campo.nombre}
                          value={(formData as any)[campo.nombre] || ""}
                          onChange={(e) => setFormData({ ...formData, [campo.nombre]: e.target.value || null })}
                          placeholder={campo.placeholder}
                          className="border-gray-300"
                          rows={3}
                        />
                      ) : campo.tipo === 'number' ? (
                        <Input
                          id={campo.nombre}
                          type="number"
                          min="0"
                          step={campo.nombre.includes('cm') ? '0.01' : '1'}
                          value={(formData as any)[campo.nombre] || ""}
                          onChange={(e) => setFormData({ ...formData, [campo.nombre]: e.target.value ? parseFloat(e.target.value) : null })}
                          placeholder={campo.placeholder}
                          className="border-gray-300"
                        />
                      ) : (
                        <Input
                          id={campo.nombre}
                          type="text"
                          value={(formData as any)[campo.nombre] || ""}
                          onChange={(e) => setFormData({ ...formData, [campo.nombre]: e.target.value || null })}
                          placeholder={campo.placeholder}
                          className="border-gray-300"
                        />
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
          

          <DialogFooter className="gap-2 mt-6">
            <Button type="button" variant="outline" onClick={onClose} className="min-w-[120px]">
              Cancelar
            </Button>
            <Button 
              type="submit" 
              className="min-w-[120px] bg-gradient-primary text-white font-semibold shadow-lg hover:opacity-90 transition-opacity"
            >
              {producto ? "Actualizar" : "Agregar"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
  
    </Dialog>
  );
};
