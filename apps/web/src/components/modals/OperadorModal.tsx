import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Operador } from "@/hooks/useOperadores";

interface OperadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (operador: Omit<Operador, 'id' | 'activo'>) => void;
}

export const OperadorModal = ({ isOpen, onClose, onSave }: OperadorModalProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
  });

  useEffect(() => {
    if (!isOpen) {
      setFormData({ nombre: '', celular: '' });
    }
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[400px]">
        <DialogHeader>
          <DialogTitle>Crear Operador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="celular">Celular</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
              placeholder="Ej: 987654321"
              required
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              Crear Operador
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
