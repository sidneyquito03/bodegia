import { useMemo, useState } from "react";
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
import { useToast } from "@/hooks/use-toast";
import { uploadPublicFile } from "@/services/files";

type ClienteDTO = {
  nombre: string;
  celular: string;
  dni?: string | null;
  direccion?: string | null;
  notas?: string | null;
  foto_url?: string | null;
  deuda_inicial?: number; // <- nuevo
};

interface ClienteModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (cliente: ClienteDTO) => void; // tu hook useFiados.createCliente espera esto
}

export const ClienteModal = ({ isOpen, onClose, onSave }: ClienteModalProps) => {
  const [nombre, setNombre] = useState("");
  const [celular, setCelular] = useState("");
  const [dni, setDni] = useState("");
  const [direccion, setDireccion] = useState("");
  const [notas, setNotas] = useState("");
  const [deudaInicial, setDeudaInicial] = useState<string>(""); // string para controlar input

  const [fotoFile, setFotoFile] = useState<File | null>(null);
  const [fotoPreview, setFotoPreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const iniciales = useMemo(() => {
    const parts = nombre.trim().split(/\s+/);
    if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
    return (parts[0]?.[0] ?? "U").toUpperCase();
  }, [nombre]);

  function cleanPhone(raw: string) {
    // Perú: 9 dígitos móvil típico. Permitimos espacios y símbolos pero los removemos.
    return raw.replace(/\D/g, "");
  }

  function isValidPhonePeru(num: string) {
    // Aceptamos 9 dígitos. (Si quieres, admite 10-11 con prefijo país.)
    return /^\d{9}$/.test(num);
  }

  function cleanDni(raw: string) {
    return raw.replace(/\D/g, "").slice(0, 8);
  }

  const handleFotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setFotoFile(file);
    const reader = new FileReader();
    reader.onloadend = () => setFotoPreview(reader.result as string);
    reader.readAsDataURL(file);
  };

  const resetForm = () => {
    setNombre("");
    setCelular("");
    setDni("");
    setDireccion("");
    setNotas("");
    setDeudaInicial("");
    setFotoFile(null);
    setFotoPreview("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const nombreOk = nombre.trim();
    const celularOk = cleanPhone(celular);
    const dniOk = cleanDni(dni);

    if (!nombreOk) {
      toast({ title: "Falta nombre", description: "El nombre es obligatorio.", variant: "destructive" });
      return;
    }
    if (!isValidPhonePeru(celularOk)) {
      toast({
        title: "Celular inválido",
        description: "Ingresa un celular peruano de 9 dígitos.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    let fotoUrl: string | undefined;

    if (fotoFile) {
      const url = await uploadPublicFile(fotoFile);
      if (!url) {
        toast({
          title: "No se pudo subir la foto",
          description: "Continuaremos sin foto. Puedes intentar más tarde.",
        });
      }
      fotoUrl = url; // puede quedar undefined
    }

    const payload: ClienteDTO = {
      nombre: nombreOk,
      celular: celularOk,
      dni: dniOk || null,
      direccion: direccion.trim() || null,
      notas: notas.trim() || null,
      foto_url: fotoUrl ?? null,
      deuda_inicial: deudaInicial.trim() ? Number(deudaInicial) || 0 : 0,
    };

    try {
      onSave(payload); // el hook hará la llamada a la API
      toast({ title: "Cliente registrado", description: nombreOk });
      resetForm();
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message ?? "No se pudo registrar el cliente",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
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
                onClick={() => document.getElementById("foto")?.click()}
              >
                <Upload className="mr-2 h-4 w-4" />
                Subir Foto (Opcional)
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Nombre */}
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

            {/* Celular */}
            <div className="space-y-2">
              <Label htmlFor="celular">Celular *</Label>
              <Input
                id="celular"
                value={celular}
                onChange={(e) => setCelular(e.target.value)}
                placeholder="999 999 999"
                inputMode="numeric"
                required
              />
            </div>

            {/* DNI (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="dni">DNI</Label>
              <Input
                id="dni"
                value={dni}
                onChange={(e) => setDni(e.target.value)}
                placeholder="12345678"
                inputMode="numeric"
                maxLength={8}
              />
            </div>

            {/* Deuda inicial (opcional) */}
            <div className="space-y-2">
              <Label htmlFor="deuda_inicial">Deuda inicial (S/.)</Label>
              <Input
                id="deuda_inicial"
                value={deudaInicial}
                onChange={(e) => setDeudaInicial(e.target.value)}
                placeholder="0.00"
                inputMode="decimal"
              />
            </div>

            {/* Dirección (opcional) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="direccion">Dirección</Label>
              <Input
                id="direccion"
                value={direccion}
                onChange={(e) => setDireccion(e.target.value)}
                placeholder="Av. Principal 123"
              />
            </div>

            {/* Notas (opcional) */}
            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="notas">Notas</Label>
              <Textarea
                id="notas"
                value={notas}
                onChange={(e) => setNotas(e.target.value)}
                placeholder="Información adicional sobre el cliente..."
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? "Guardando..." : "Registrar Cliente"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
