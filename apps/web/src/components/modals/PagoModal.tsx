import { useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { useToast } from "@/hooks/use-toast";
import { uploadPublicFile } from "@/services/files";

interface PagoModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    monto: number,
    descripcion: string,
    metodoPago: string,
    referencia?: string,
    comprobanteUrl?: string
  ) => void;
  clienteNombre: string;
  deudaActual: number;
}

export const PagoModal = ({
  isOpen,
  onClose,
  onSave,
  clienteNombre,
  deudaActual,
}: PagoModalProps) => {
  const [monto, setMonto] = useState<string>("");
  const [descripcion, setDescripcion] = useState("");
  const [metodoPago, setMetodoPago] = useState("efectivo");
  const [referencia, setReferencia] = useState("");
  const [comprobanteFile, setComprobanteFile] = useState<File | null>(null);
  const [comprobantePreview, setComprobantePreview] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  const { toast } = useToast();

  const deudaFmt = useMemo(
    () => `S/. ${deudaActual.toFixed(2)}`,
    [deudaActual]
  );

  const necesitaReferencia = metodoPago !== "efectivo";

  function parseMonto(value: string) {
    // Acepta coma o punto como decimal y solo números
    const norm = value.replace(",", ".").replace(/[^\d.]/g, "");
    const num = Number(norm);
    return Number.isFinite(num) ? num : NaN;
  }

  function onComprobanteChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setComprobanteFile(file);
    if (file) {
      const fr = new FileReader();
      fr.onloadend = () => setComprobantePreview(fr.result as string);
      fr.readAsDataURL(file);
    } else {
      setComprobantePreview("");
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const montoNum = parseMonto(monto);

    if (!(montoNum > 0)) {
      toast({
        title: "Monto inválido",
        description: "El monto debe ser mayor que 0.",
        variant: "destructive",
      });
      return;
    }
    if (montoNum > deudaActual) {
      toast({
        title: "Sobrepago",
        description: `El monto (${montoNum.toFixed(
          2
        )}) no puede exceder la deuda actual (${deudaFmt}).`,
        variant: "destructive",
      });
      return;
    }
    if (necesitaReferencia && !referencia.trim()) {
      toast({
        title: "Referencia requerida",
        description: "Ingresa una referencia para el método seleccionado.",
        variant: "destructive",
      });
      return;
    }

    setSubmitting(true);
    let comprobanteUrl: string | undefined;

    if (comprobanteFile) {
      // Subida opcional, NO bloquea si falla
      try {
        const url = await uploadPublicFile(comprobanteFile);
        if (!url) {
          toast({
            title: "No se pudo subir el comprobante",
            description: "Registraremos el pago sin comprobante.",
          });
        }
        comprobanteUrl = url;
      } catch {
        // Silencioso: ya notificamos arriba
      }
    }

    try {
      onSave(
        montoNum,
        descripcion.trim(),
        metodoPago,
        referencia.trim() || undefined,
        comprobanteUrl
      );
      // reset
      setMonto("");
      setDescripcion("");
      setMetodoPago("efectivo");
      setReferencia("");
      setComprobanteFile(null);
      setComprobantePreview("");
      onClose();
    } catch (err: any) {
      toast({
        title: "Error",
        description: err?.message ?? "No se pudo registrar el pago",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[500px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label>Cliente</Label>
            <div className="text-sm font-medium p-2 bg-muted rounded">
              {clienteNombre}
            </div>
          </div>

          <div className="space-y-2">
            <Label>Deuda Actual</Label>
            <div className="text-lg font-bold text-destructive p-2 bg-muted rounded">
              {deudaFmt}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="monto">Monto a Pagar</Label>
            <Input
              id="monto"
              inputMode="decimal"
              value={monto}
              onChange={(e) => setMonto(e.target.value)}
              placeholder="0.00"
              required
            />
            <p className="text-xs text-muted-foreground">
              No puede exceder la deuda actual.
            </p>
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
                <SelectValue placeholder="Selecciona un método" />
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

          {necesitaReferencia && (
            <div className="space-y-2">
              <Label htmlFor="referencia">Número de Referencia</Label>
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
            <div className="flex items-center gap-2">
              <Input
                id="comprobante"
                type="file"
                accept="image/*"
                onChange={onComprobanteChange}
                className="flex-1"
              />
              {comprobantePreview && (
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  onClick={() => window.open(comprobantePreview, "_blank")}
                  title="Ver comprobante"
                >
                  <ImageIcon className="h-4 w-4" />
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Sube una captura (JPG/PNG) de la transferencia, Yape/Plin, etc.
            </p>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? (
                <>
                  <Upload className="mr-2 h-4 w-4 animate-pulse" />
                  Registrando...
                </>
              ) : (
                "Registrar Pago"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
