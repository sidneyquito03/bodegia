import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface EditarPagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, monto: number, descripcion: string, metodoPago: string) => void;
  transaccion: any;
}

export const EditarPagoModal = ({ isOpen, onClose, onSave, transaccion }: EditarPagoModalProps) => {
  const [monto, setMonto] = useState('');
  const [descripcion, setDescripcion] = useState('');
  const [metodoPago, setMetodoPago] = useState('efectivo');

  useEffect(() => {
    if (transaccion) {
      setMonto(transaccion.monto.toString());
      setDescripcion(transaccion.descripcion || '');
      setMetodoPago(transaccion.metodo_pago || 'efectivo');
    }
  }, [transaccion]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const montoNum = parseFloat(monto);
    if (montoNum > 0) {
      onSave(transaccion.id, montoNum, descripcion, metodoPago);
      onClose();
    }
  };

  if (!transaccion) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Transacción</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="monto">Monto (S/.)</Label>
            <Input
              id="monto"
              type="number"
              step="0.01"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metodoPago">Método de Pago</Label>
            <Select value={metodoPago} onValueChange={setMetodoPago}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="efectivo">💵 Efectivo</SelectItem>
                <SelectItem value="yape">📱 Yape</SelectItem>
                <SelectItem value="plin">📱 Plin</SelectItem>
                <SelectItem value="transferencia">🏦 Transferencia</SelectItem>
                <SelectItem value="tarjeta">💳 Tarjeta</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="descripcion">Descripción</Label>
            <Textarea
              id="descripcion"
              value={descripcion}
              onChange={(e) => setDescripcion(e.target.value)}
              placeholder="Detalles de la transacción..."
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Guardar Cambios
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};