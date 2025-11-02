import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Operador } from "@/hooks/useOperadores";

interface EditarOperadorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, data: Partial<Operador>) => void;
  operador: Operador | null;
}

export const EditarOperadorModal = ({ isOpen, onClose, onSave, operador }: EditarOperadorModalProps) => {
  const [formData, setFormData] = useState({
    nombre: '',
    celular: '',
    email: '',
    dni: '',
    direccion: '',
  });

  useEffect(() => {
    if (operador) {
      setFormData({
        nombre: operador.nombre || '',
        celular: operador.celular || '',
        email: (operador as any).email || '',
        dni: (operador as any).dni || '',
        direccion: (operador as any).direccion || '',
      });
    } else {
      setFormData({ nombre: '', celular: '', email: '', dni: '', direccion: '' });
    }
  }, [operador, isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (operador) {
      onSave(operador.id, formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Editar Operador</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="nombre">Nombre Completo *</Label>
            <Input
              id="nombre"
              value={formData.nombre}
              onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              placeholder="Ej: Juan Pérez"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="celular">Celular *</Label>
            <Input
              id="celular"
              value={formData.celular}
              onChange={(e) => setFormData({ ...formData, celular: e.target.value })}
              placeholder="Ej: 987654321"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="dni">DNI</Label>
            <Input
              id="dni"
              value={formData.dni}
              onChange={(e) => setFormData({ ...formData, dni: e.target.value })}
              placeholder="Ej: 12345678"
              maxLength={8}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              placeholder="Ej: juan@ejemplo.com"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
              placeholder="Ej: Av. Principal 123"
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