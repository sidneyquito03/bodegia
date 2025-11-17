import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Producto } from "@/hooks/useInventario";
import { 
  Package, 
  Barcode, 
  DollarSign, 
  TrendingUp, 
  Tag, 
  Truck, 
  Calendar, 
  Weight, 
  Image as ImageIcon,
  AlertTriangle,
  CheckCircle
} from "lucide-react";

interface DetalleProductoModalProps {
  isOpen: boolean;
  onClose: () => void;
  producto: Producto | null;
  nombreProveedor?: string;
}

export const DetalleProductoModal = ({ 
  isOpen, 
  onClose, 
  producto,
  nombreProveedor 
}: DetalleProductoModalProps) => {
  if (!producto) return null;

  const ganancia = ((producto.precio_venta - producto.precio_costo) / producto.precio_costo * 100);
  const diasVencimiento = producto.fecha_vencimiento 
    ? Math.ceil((new Date(producto.fecha_vencimiento).getTime() - Date.now()) / (1000 * 60 * 60 * 24))
    : null;

  const getEstadoColor = (estado: string) => {
    switch (estado) {
      case "Disponible":
        return "bg-success text-success-foreground";
      case "Stock Bajo":
        return "bg-warning text-warning-foreground";
      case "Stock Crítico":
      case "Vencido":
        return "bg-destructive text-destructive-foreground";
      case "Agotado":
        return "bg-muted text-muted-foreground";
      default:
        return "bg-secondary text-secondary-foreground";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Detalles del Producto</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Imagen y Estado */}
          <div className="flex gap-6">
            <div className="shrink-0">
              {producto.imagen_url ? (
                <img
                  src={producto.imagen_url}
                  alt={producto.nombre}
                  className="w-40 h-40 object-cover rounded-lg border"
                />
              ) : (
                <div className="w-40 h-40 bg-muted rounded-lg flex items-center justify-center">
                  <ImageIcon className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
            </div>
            
            <div className="flex-1 space-y-3">
              <div>
                <h3 className="text-2xl font-bold">{producto.nombre}</h3>
                <Badge className={`mt-2 ${getEstadoColor(producto.estado)}`}>
                  {producto.estado}
                </Badge>
              </div>
              
              {diasVencimiento !== null && (
                <div className="flex items-center gap-2 text-sm">
                  {diasVencimiento <= 0 ? (
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                  ) : diasVencimiento <= 7 ? (
                    <AlertTriangle className="h-4 w-4 text-warning" />
                  ) : (
                    <CheckCircle className="h-4 w-4 text-success" />
                  )}
                  <span className={
                    diasVencimiento <= 0 ? "text-destructive font-medium" :
                    diasVencimiento <= 7 ? "text-warning font-medium" :
                    "text-muted-foreground"
                  }>
                    {diasVencimiento <= 0 
                      ? "¡Producto vencido!" 
                      : diasVencimiento <= 7
                      ? `Vence en ${diasVencimiento} día(s)`
                      : `${diasVencimiento} días hasta vencer`
                    }
                  </span>
                </div>
              )}
            </div>
          </div>

          <Separator />

          {/* Información Básica */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Barcode className="h-4 w-4" />
                Código
              </div>
              <p className="text-lg font-mono">{producto.codigo}</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <Package className="h-4 w-4" />
                Stock Actual
              </div>
              <p className="text-lg font-semibold">
                {producto.stock} unidades
              </p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                Stock Crítico
              </div>
              <p className="text-lg">{producto.stock_critico ?? 10} unidades</p>
            </div>

            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <AlertTriangle className="h-4 w-4" />
                Stock Bajo
              </div>
              <p className="text-lg">{producto.stock_bajo ?? 20} unidades</p>
            </div>
          </div>

          <Separator />

          {/* Precios y Ganancia */}
          <div className="space-y-4">
            <h4 className="font-semibold flex items-center gap-2">
              <DollarSign className="h-4 w-4" />
              Información de Precios
            </h4>
            
            <div className="grid grid-cols-3 gap-4">
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Precio Costo</p>
                <p className="text-xl font-bold">S/. {producto.precio_costo.toFixed(2)}</p>
              </div>
              
              <div className="bg-muted/50 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Precio Venta</p>
                <p className="text-xl font-bold text-primary">S/. {producto.precio_venta.toFixed(2)}</p>
              </div>
              
              <div className="bg-success/10 rounded-lg p-4">
                <p className="text-sm text-muted-foreground mb-1">Ganancia</p>
                <p className="text-xl font-bold text-success flex items-center gap-1">
                  <TrendingUp className="h-5 w-5" />
                  {ganancia.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Información Adicional */}
          <div className="space-y-3">
            <h4 className="font-semibold">Información Adicional</h4>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-start gap-3">
                <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                <div>
                  <p className="text-sm font-medium">Categoría</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {producto.categoria}
                  </p>
                </div>
              </div>

              {producto.marca && (
                <div className="flex items-start gap-3">
                  <Tag className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Marca</p>
                    <p className="text-sm text-muted-foreground">{producto.marca}</p>
                  </div>
                </div>
              )}

              {producto.medida_peso && (
                <div className="flex items-start gap-3">
                  <Weight className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Medida/Peso</p>
                    <p className="text-sm text-muted-foreground">{producto.medida_peso}</p>
                  </div>
                </div>
              )}

              {nombreProveedor && (
                <div className="flex items-start gap-3">
                  <Truck className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Proveedor</p>
                    <p className="text-sm text-muted-foreground">{nombreProveedor}</p>
                  </div>
                </div>
              )}

              {producto.fecha_vencimiento && (
                <div className="flex items-start gap-3">
                  <Calendar className="h-4 w-4 mt-1 text-muted-foreground" />
                  <div>
                    <p className="text-sm font-medium">Fecha de Vencimiento</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(producto.fecha_vencimiento).toLocaleDateString('es-PE')}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Fechas de registro */}
          {producto.created_at && (
            <>
              <Separator />
              <div className="grid grid-cols-2 gap-4 text-sm text-muted-foreground">
                <div>
                  <p className="font-medium">Fecha de Registro</p>
                  <p>{new Date(producto.created_at).toLocaleString('es-PE')}</p>
                </div>
                {producto.updated_at && (
                  <div>
                    <p className="font-medium">Última Actualización</p>
                    <p>{new Date(producto.updated_at).toLocaleString('es-PE')}</p>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
