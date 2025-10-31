import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter
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
import { Upload, Image as ImageIcon } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (monto: number, descripcion: string, metodoPago: string, referencia?: string, comprobanteUrl?: string) => void;
  clienteNombre: string;
  deudaActual: number;
}

export const PagoModal = ({ isOpen, onClose, onSave, clienteNombre, deudaActual }: PagoModalProps) => {
  const [monto, setMonto] = useState("");
  const [descripcion, setDescripcion] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [referencia, setReferencia] = useState("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (montoNum > 0 && montoNum <= deudaActual) {
      let comprobanteUrl;
      
      // Subir comprobante si existe
      if (comprobanteFile) {
        setUploading(true);
        try {
          const fileExt = comprobanteFile.name.split('.').pop();
          const fileName = `${Date.now()}.${fileExt}`;
          const { error: uploadError } = await supabase.storage
            .from('comprobantes-fiados')
            .upload(fileName, comprobanteFile);

          if (uploadError) throw uploadError;
          
          const { data: { publicUrl } } = supabase.storage
            .from('comprobantes-fiados')
            .getPublicUrl(fileName);
          
          comprobanteUrl = publicUrl;
        } catch (error) {
          console.error('Error subiendo comprobante:', error);
          toast({
            title: "Error",
            description: "No se pudo subir el comprobante",
            variant: "destructive"
          });
          setUploading(false);
          return;
        }
        setUploading(false);
      }

      onSave(montoNum, descripcion, metodoPago, referencia || undefined, comprobanteUrl);
      setMonto("");
      setDescripcion("");
      setMetodoPago("efectivo");
      setReferencia("");
      setComprobanteFile(null);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="text-sm font-medium p-2 bg-muted rounded">{clienteNombre}</div>
          </div>

          <div className="space-y-2">
            <Label>Deuda Actual</Label>
            <div className="text-lg font-bold text-destructive p-2 bg-muted rounded">
              S/. {deudaActual.toFixed(2)}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto a Pagar</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              min="0.01"
              max={deudaActual}
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción (opcional)</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles del pago..."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodo">Método de Pago</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger id="metodo">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">Efectivo</SelectItem>
                <SelectItem value="yape">Yape</SelectItem>
                <SelectItem value="plin">Plin</SelectItem>
                <SelectItem value="transferencia">Transferencia</SelectItem>
                <SelectItem value="tarjeta">Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {metodoPago !== 'efectivo' && (
            <div className="space-y-2">
              <Label htmlFor="referencia">Número de Referencia (opcional)</Label>
              <Input
                id="referencia"
                value={referencia}
                onChange={(e) => setReferencia(e.target.value)}
                placeholder="Ej: OP-123456"
              />
            </div>
          )}

          <div className="space-y-2">
            <Label htmlFor="comprobante">Comprobante (opcional)</Label>
            <div className="flex gap-2">
              <Input
                id="comprobante"
                type="file"
                accept="image/*"
                onChange={(e) => setComprobanteFile(e.target.files?.[0] || null)}
                className="flex-1"
              />
              {comprobanteFile && (
                <Button type="button" variant="outline" size="icon">
                  <ImageIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sube una captura de la transferencia
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Subiendo...
                </>
              ) : (
                'Registrar Pago'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
