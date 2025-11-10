import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Proveedor } from "@/hooks/useProveedores";

interface EditarProveedorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (id: string, proveedor: Partial<Proveedor>) => void;
  proveedor: Proveedor | null;
}

export const EditarProveedorModal = ({ isOpen, onClose, onSave, proveedor }: EditarProveedorModalProps) => {
  const [formData, setFormData] = useState({
    nombre: "",
    ruc: "",
    contacto: "",
    telefono: "",
    email: "",
    direccion: "",
    tiempo_entrega_dias: 0,
    notas: "",
  });

  useEffect(() => {
    if (proveedor) {
      setFormData({
        nombre: proveedor.nombre || "",
        ruc: proveedor.ruc || "",
        contacto: proveedor.contacto || "",
        telefono: proveedor.telefono || "",
        email: proveedor.email || "",
        direccion: proveedor.direccion || "",
        tiempo_entrega_dias: proveedor.tiempo_entrega_dias || 0,
        notas: proveedor.notas || "",
      });
    }
  }, [proveedor]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (proveedor) {
      onSave(proveedor.id, formData);
      onClose();
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Proveedor</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                required
                value={formData.nombre}
                onChange={(e) => setFormData({ ...formData, nombre: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="ruc">RUC</Label>
              <Input
                id="ruc"
                value={formData.ruc}
                onChange={(e) => setFormData({ ...formData, ruc: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="contacto">Persona de Contacto</Label>
              <Input
                id="contacto"
                value={formData.contacto}
                onChange={(e) => setFormData({ ...formData, contacto: e.target.value })}
              />
            </div>
            <div>
              <Label htmlFor="telefono">Teléfono</Label>
              <Input
                id="telefono"
                value={formData.telefono}
                onChange={(e) => setFormData({ ...formData, telefono: e.target.value })}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={formData.direccion}
              onChange={(e) => setFormData({ ...formData, direccion: e.target.value })}
            />
          </div>

          <div>
            <Label htmlFor="tiempo_entrega">Tiempo de Entrega (días)</Label>
            <Input
              id="tiempo_entrega"
              type="number"
              min="0"
              value={formData.tiempo_entrega_dias}
              onChange={(e) => setFormData({ ...formData, tiempo_entrega_dias: parseInt(e.target.value) || 0 })}
            />
          </div>

          <div>
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={formData.notas}
              onChange={(e) => setFormData({ ...formData, notas: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};