import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from "xlsx";
import { importProductosJson} from "@/services/inventory";

const FIELD_ALIASES: Record<string, string> = {
 nombre: "nombre",
  producto: "nombre",
  name: "nombre",
  "product name": "nombre",

  codigo: "codigo",
  "código": "codigo",
  sku: "codigo",
  cod: "codigo",
  "id producto": "codigo",

  stock: "stock",
  existencias: "stock",
  cantidad: "stock",
  qty: "stock",

  "precio_costo": "precio_costo",
  "precio costo": "precio_costo",
  costo: "precio_costo",
  cost: "precio_costo",

  "precio_venta": "precio_venta",
  "precio venta": "precio_venta",
  venta: "precio_venta",
  price: "precio_venta",

  categoria: "categoria",
  categoría: "categoria",
  category: "categoria",

  estado: "estado",
  status: "estado",

  fecha_vencimiento: "fecha_vencimiento",
  vencimiento: "fecha_vencimiento",
  "fecha vencimiento": "fecha_vencimiento",
  expiry: "fecha_vencimiento",
  "exp date": "fecha_vencimiento",

  proveedor: "proveedor_nombre",     
  "proveedor id": "proveedor_id",
  marca: "marca",
  "brand": "marca",
  medida: "medida_peso",
  "medida/peso": "medida_peso",
  peso: "medida_peso",
  unidad: "medida_peso",
  "stock critico": "stock_critico",
  "stock crítico": "stock_critico",
  "stock bajo": "stock_bajo",
  imagen: "imagen_url",
  "imagen url": "imagen_url",
};

function normalizeKey(k: string) {
  return k
    .toLowerCase()
    .trim()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");
}

function mapHeaders(rawRow: any) {
  const out: any = {};
  for (const key of Object.keys(rawRow)) {
    const nk = normalizeKey(key);
    const target = FIELD_ALIASES[nk] ?? nk;
    out[target] = rawRow[key];
  }
  return out;
}

function sanitizeRow(row: any) {
  const fecha = row.fecha_vencimiento
    ? new Date(row.fecha_vencimiento)
    : null;

  return {
    nombre: String(row.nombre ?? "").trim(),
    codigo: String(row.codigo ?? "").trim(),
    stock: Number(row.stock ?? 0) || 0,
    precio_costo: Number(row.precio_costo ?? 0) || 0,
    precio_venta: Number(row.precio_venta ?? 0) || 0,
    categoria: String(row.categoria ?? "general").trim().toLowerCase(),
    estado: row.estado ? String(row.estado).trim() : "Disponible",
    fecha_vencimiento: fecha ? fecha.toISOString() : null,
    proveedor_id: row.proveedor_id ? String(row.proveedor_id) : null,
    proveedor_nombre: row.proveedor_nombre ? String(row.proveedor_nombre).trim() : null,
    marca: row.marca ? String(row.marca).trim() : null,
    medida_peso: row.medida_peso ? String(row.medida_peso).trim() : null,
    stock_critico: row.stock_critico != null ? Number(row.stock_critico) || 0 : undefined,
    stock_bajo: row.stock_bajo != null ? Number(row.stock_bajo) || 0 : undefined,
    imagen_url: row.imagen_url ? String(row.imagen_url).trim() : null,
  };
}

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
};

export const CargaMasivaModal = ({ isOpen, onClose, onSuccess }: Props) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const [rawFile, setRawFile] = useState<File | null>(null);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      {
        nombre: "Ejemplo Producto",
        codigo: "PROD001",
        stock: 100,
        precio_costo: 10.5,
        precio_venta: 15.0,
        categoria: "general",
        estado: "Disponible",
        fecha_vencimiento: "2025-12-31",
      },
    ];
    const ws = XLSX.utils.json_to_sheet(template);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Productos");
    XLSX.writeFile(wb, "plantilla_productos.xlsx");
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet); 
      const mapped = (jsonData as any[]).map((row) => sanitizeRow(mapHeaders(row)));

      setPreview(mapped);
      setRawFile(file);

      toast({
        title: "Archivo cargado",
        description: `Se detectaron ${mapped.length} productos`,
      });
    } catch (error) {
      console.error("Error leyendo archivo:", error);
      toast({
        title: "Error",
        description: "No se pudo leer el archivo Excel",
        variant: "destructive",
      });
    }
  };

  const handleImport = async () => {
    if (preview.length === 0) {
      toast({
        title: "Error",
        description: "No hay productos para importar",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const res = await importProductosJson(preview);
      toast({
        title: "Importación exitosa",
        description: `Insertados/actualizados: ${res.inserted + res.updated} (ins: ${res.inserted}, upd: ${res.updated})`,
      });

      setPreview([]);
      setRawFile(null);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error("Error importando productos:", error);
      toast({
        title: "Error",
        description: error?.message ?? "No se pudieron importar los productos",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Carga Masiva de Productos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1" onClick={downloadTemplate}>
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla
            </Button>

            <label className="flex-1">
              <Button variant="outline" className="w-full" asChild>
                <span>
                  <Upload className="h-4 w-4 mr-2" />
                  Cargar Excel
                </span>
              </Button>
              <input
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
              />
            </label>
          </div>

          {preview.length > 0 && (
            <>
              <div className="border rounded-lg p-4 bg-muted/50">
                <div className="flex items-center gap-2 mb-2">
                  <FileSpreadsheet className="h-5 w-5" />
                  <span className="font-medium">
                    Vista previa normalizada: {preview.length} productos
                  </span>
                </div>
                <div className="max-h-64 overflow-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-2">Nombre</th>
                        <th className="text-left p-2">Código</th>
                        <th className="text-left p-2">Stock</th>
                        <th className="text-left p-2">P. Costo</th>
                        <th className="text-left p-2">P. Venta</th>
                        <th className="text-left p-2">Categoría</th>
                        <th className="text-left p-2">Vence</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((item, i) => (
                        <tr key={i} className="border-b">
                          <td className="p-2">{item.nombre}</td>
                          <td className="p-2">{item.codigo}</td>
                          <td className="p-2">{item.stock}</td>
                          <td className="p-2">S/. {item.precio_costo}</td>
                          <td className="p-2">S/. {item.precio_venta}</td>
                          <td className="p-2">{item.categoria}</td>
                          <td className="p-2">
                            {item.fecha_vencimiento?.substring(0, 10) ?? "-"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                  {preview.length > 10 && (
                    <p className="text-center text-muted-foreground mt-2">
                      ... y {preview.length - 10} más
                    </p>
                  )}
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={onClose}>
                  Cancelar
                </Button>
                <Button onClick={handleImport} disabled={loading}>
                  {loading ? "Importando..." : "Importar Productos"}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
