import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { TrendingUp, TrendingDown } from "lucide-react";

interface HistorialPreciosModalProps {
  isOpen: boolean;
  onClose: () => void;
  productoId: string;
  productoNombre: string;
}

interface HistorialPrecio {
  id: string;
  precio_costo_anterior: number;
  precio_venta_anterior: number;
  precio_costo_nuevo: number;
  precio_venta_nuevo: number;
  motivo: string;
  created_at: string;
}

export const HistorialPreciosModal = ({
  isOpen,
  onClose,
  productoId,
  productoNombre
}: HistorialPreciosModalProps) => {
  const [historial, setHistorial] = useState<HistorialPrecio[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && productoId) {
      fetchHistorial();
    }
  }, [isOpen, productoId]);

  const fetchHistorial = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('historial_precios')
      .select('*')
      .eq('producto_id', productoId)
      .order('created_at', { ascending: false });

    if (!error && data) {
      setHistorial(data);
    }
    setLoading(false);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Historial de Precios: {productoNombre}</DialogTitle>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center text-muted-foreground">
            Cargando historial...
          </div>
        ) : historial.length === 0 ? (
          <div className="py-8 text-center text-muted-foreground">
            No hay historial de cambios de precio para este producto.
          </div>
        ) : (
          <div className="space-y-4">
            {historial.map((item) => {
              const aumentoCosto = item.precio_costo_nuevo > item.precio_costo_anterior;
              const aumentoVenta = item.precio_venta_nuevo > item.precio_venta_anterior;
              
              return (
                <div key={item.id} className="p-4 border rounded-lg bg-card">
                  <div className="flex justify-between items-start mb-2">
                    <span className="text-sm text-muted-foreground">
                      {format(new Date(item.created_at), "dd 'de' MMMM, yyyy 'a las' HH:mm", { locale: es })}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-4 mt-3">
                    <div>
                      <p className="text-sm font-medium mb-1">Precio de Costo</p>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">
                          S/. {item.precio_costo_anterior.toFixed(2)}
                        </span>
                        <span className="text-lg font-semibold">
                          S/. {item.precio_costo_nuevo.toFixed(2)}
                        </span>
                        {aumentoCosto ? (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-1">Precio de Venta</p>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground line-through">
                          S/. {item.precio_venta_anterior.toFixed(2)}
                        </span>
                        <span className="text-lg font-semibold">
                          S/. {item.precio_venta_nuevo.toFixed(2)}
                        </span>
                        {aumentoVenta ? (
                          <TrendingUp className="h-4 w-4 text-destructive" />
                        ) : (
                          <TrendingDown className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                    </div>
                  </div>

                  {item.motivo && (
                    <p className="mt-3 text-sm text-muted-foreground italic">
                      Motivo: {item.motivo}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};
