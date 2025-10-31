import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet } from "lucide-react";
import * as XLSX from 'xlsx';
import { supabase } from "@/integrations/supabase/client";

interface CargaMasivaModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export const CargaMasivaModal = ({ isOpen, onClose, onSuccess }: CargaMasivaModalProps) => {
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState<any[]>([]);
  const { toast } = useToast();

  const downloadTemplate = () => {
    const template = [
      {
        nombre: "Ejemplo Producto",
        codigo: "PROD001",
        stock: 100,
        precio_costo: 10.50,
        precio_venta: 15.00,
        categoria: "General",
        estado: "Disponible"
      }
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
      
      setPreview(jsonData);
      
      toast({
        title: "Archivo cargado",
        description: `Se encontraron ${jsonData.length} productos`,
      });
    } catch (error) {
      console.error('Error leyendo archivo:', error);
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
      const productos = preview.map((item: any) => ({
        nombre: item.nombre,
        codigo: item.codigo,
        stock: parseInt(item.stock) || 0,
        precio_costo: parseFloat(item.precio_costo) || 0,
        precio_venta: parseFloat(item.precio_venta) || 0,
        categoria: (item.categoria || 'General').toLowerCase().trim(),
        estado: item.estado || 'Disponible'
      }));

      const { error } = await supabase
        .from('productos')
        .insert(productos);

      if (error) throw error;

      toast({
        title: "Importación exitosa",
        description: `Se importaron ${productos.length} productos`,
      });

      setPreview([]);
      onSuccess();
      onClose();
    } catch (error: any) {
      console.error('Error importando productos:', error);
      toast({
        title: "Error",
        description: error.message || "No se pudieron importar los productos",
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
            <Button
              variant="outline"
              className="flex-1"
              onClick={downloadTemplate}
            >
              <Download className="h-4 w-4 mr-2" />
              Descargar Plantilla
            </Button>
            
            <label className="flex-1">
              <Button
                variant="outline"
                className="w-full"
                asChild
              >
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
                    Vista previa: {preview.length} productos
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
                      </tr>
                    </thead>
                    <tbody>
                      {preview.slice(0, 10).map((item: any, index) => (
                        <tr key={index} className="border-b">
                          <td className="p-2">{item.nombre}</td>
                          <td className="p-2">{item.codigo}</td>
                          <td className="p-2">{item.stock}</td>
                          <td className="p-2">S/. {item.precio_costo}</td>
                          <td className="p-2">S/. {item.precio_venta}</td>
                          <td className="p-2">{item.categoria}</td>
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
