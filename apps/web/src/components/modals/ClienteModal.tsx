import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Upload, User } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: any) => void;
}

export const ClienteModal = ({ isOpen, onClose, onSave }: ClienteModalProps) => {
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [uploading, setUploading] = useState(false);
  const { toast } = useToast();

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setFotoFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setFotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!nombre || !celular) {
      toast({
        title: "Error",
        description: "Nombre y celular son obligatorios",
        variant: "destructive"
      });
      return;
    }

    let fotoUrl;

    // Subir foto si existe
    if (fotoFile) {
      setUploading(true);
      try {
        const fileExt = fotoFile.name.split('.').pop();
        const fileName = `${Date.now()}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('fotos-clientes')
          .upload(fileName, fotoFile);

        if (uploadError) throw uploadError;
        
        const { data: { publicUrl } } = supabase.storage
          .from('fotos-clientes')
          .getPublicUrl(fileName);
        
        fotoUrl = publicUrl;
      } catch (error) {
        console.error('Error subiendo foto:', error);
        toast({
          title: "Error",
          description: "No se pudo subir la foto",
          variant: "destructive"
        });
        setUploading(false);
        return;
      }
      setUploading(false);
    }

    const clienteData = {
      nombre,
      celular,
      dni: dni || null,
      email: email || null,
      direccion: direccion || null,
      notas: notas || null,
      foto_url: fotoUrl || null,
      deuda_total: 0,
      activo: true
    };

    onSave(clienteData);
    
    // Reset form
    setNombre("");
    setCelular("");
    setDni("");
    setEmail("");
    setDireccion("");
    setNotas("");
    setFotoFile(null);
    setFotoPreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Nuevo Cliente</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Foto del cliente */}
          <div className="flex flex-col items-center gap-4">
            <Avatar className="h-24 w-24">
              <AvatarImage src={fotoPreview} />
              <AvatarFallback>
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            <div>
              <Input
                id="foto"
                type="file"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => document.getElementById('foto')?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir Foto (Opcional)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="nombre">Nombre Completo *</Label>
              <Input
                id="nombre"
                value={nombre}
                onChange={(e) => setNombre(e.target.value)}
                placeholder="Juan Pérez"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="celular">Celular *</Label>
              <Input
                id="celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="999 999 999"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="12345678"
                maxLength={8}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@ejemplo.com"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="direccion">Dirección</Label>
            <Input
              id="direccion"
              value={direccion}
              onChange={(e) => setDireccion(e.target.value)}
              placeholder="Av. Principal 123"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notas">Notas</Label>
            <Textarea
              id="notas"
              value={notas}
              onChange={(e) => setNotas(e.target.value)}
              placeholder="Información adicional sobre el cliente..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={uploading}>
              {uploading ? 'Subiendo...' : 'Registrar Cliente'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
