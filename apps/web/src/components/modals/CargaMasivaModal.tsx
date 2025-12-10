import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { Upload, Download, FileSpreadsheet, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import * as XLSX from "xlsx";
import { importProductosJson} from "@/services/inventory";

const FIELD_ALIASES: Record<string, string> = {
  // Campos básicos obligatorios
  nombre: "nombre",
  "nombre*": "nombre",
  "* nombre": "nombre",
  producto: "nombre",
  name: "nombre",
  "product name": "nombre",

  codigo: "codigo",
  "codigo*": "codigo",
  "* codigo": "codigo",
  "código": "codigo",
  "código*": "codigo",
  "* código": "codigo",
  sku: "codigo",
  cod: "codigo",
  "id producto": "codigo",

  stock: "stock",
  "stock*": "stock",
  "* stock": "stock",
  "stock inicial": "stock",
  "stock inicial*": "stock",
  "* stock inicial": "stock",
  existencias: "stock",
  cantidad: "stock",
  qty: "stock",

  "precio_costo": "precio_costo",
  "precio costo": "precio_costo",
  "precio costo*": "precio_costo",
  "* precio costo": "precio_costo",
  costo: "precio_costo",
  cost: "precio_costo",

  "precio_venta": "precio_venta",
  "precio venta": "precio_venta",
  "precio venta*": "precio_venta",
  "* precio venta": "precio_venta",
  venta: "precio_venta",
  price: "precio_venta",

  categoria: "categoria",
  "categoria*": "categoria",
  "* categoria": "categoria",
  "categoría": "categoria",
  "categoría*": "categoria",
  "* categoría": "categoria",
  category: "categoria",

  estado: "estado",
  "estado*": "estado",
  status: "estado",

  // Campos opcionales básicos
  "fecha_vencimiento": "fecha_vencimiento",
  "fecha vencimiento": "fecha_vencimiento",
  "fecha vencimiento*": "fecha_vencimiento",
  vencimiento: "fecha_vencimiento",
  expiry: "fecha_vencimiento",
  "exp date": "fecha_vencimiento",

  proveedor: "proveedor_nombre",
  "proveedor nombre": "proveedor_nombre",
  "proveedor id": "proveedor_id",
  "proveedor id / ruc": "proveedor_id",
  
  marca: "marca",
  brand: "marca",
  
  medida: "medida_peso",
  "medida / peso": "medida_peso",
  "medida/peso": "medida_peso",
  peso: "medida_peso",
  unidad: "medida_peso",
  
  "stock bajo": "stock_bajo",
  "stock_bajo": "stock_bajo",
  
  imagen: "imagen_url",
  "imagen url": "imagen_url",
  "url imagen": "imagen_url",
  "imagen_url": "imagen_url",

  // Campos específicos - ROPA/CALZADO
  talla: "talla",
  size: "talla",
  
  color: "color",
  colour: "color",
  
  genero: "genero",
  "género": "genero",
  gender: "genero",
  sexo: "genero",
  
  "tipo_tela": "tipo_tela",
  "tipo tela": "tipo_tela",
  tela: "tipo_tela",
  material: "material",
  
  // Campos específicos - TECNOLOGÍA
  garantia: "garantia_dias",
  "garantía": "garantia_dias",
  "garantia dias": "garantia_dias",
  "garantía días": "garantia_dias",
  "garantia_dias": "garantia_dias",
  warranty: "garantia_dias",
  
  "detalles_clave": "detalles_clave",
  "detalles clave": "detalles_clave",
  detalles: "detalles_clave",
  especificaciones: "detalles_clave",
  
  "especificacion_electrica": "especificacion_electrica",
  "especificación eléctrica": "especificacion_electrica",
  voltaje: "especificacion_electrica",
  
  // Campos específicos - LIBRERÍA
  autor: "autor",
  author: "autor",
  escritor: "autor",
  
  editorial: "editorial",
  publisher: "editorial",
  
  isbn: "isbn_ean",
  "isbn_ean": "isbn_ean",
  ean: "isbn_ean",
  
  "formato_libro": "formato_libro",
  "formato libro": "formato_libro",
  formato: "formato_libro",
  
  "numero_paginas": "numero_paginas",
  "número páginas": "numero_paginas",
  "numero paginas": "numero_paginas",
  paginas: "numero_paginas",
  pages: "numero_paginas",
  
  // Campos específicos - MASCOTAS
  "tipo_mascota": "tipo_mascota",
  "tipo mascota": "tipo_mascota",
  mascota: "tipo_mascota",
  pet: "tipo_mascota",
  
  // Campos específicos - BELLEZA/ASEO
  "tono_aroma": "tono_aroma",
  "tono aroma": "tono_aroma",
  tono: "tono_aroma",
  aroma: "tono_aroma",
  fragancia: "tono_aroma",
  
  "tipo_piel_cabello": "tipo_piel_cabello",
  "tipo piel cabello": "tipo_piel_cabello",
  "tipo piel": "tipo_piel_cabello",
  "tipo cabello": "tipo_piel_cabello",
  
  // Campos específicos - ABARROTES
  "volumen_peso_neto": "volumen_peso_neto",
  "volumen peso neto": "volumen_peso_neto",
  "peso neto": "volumen_peso_neto",
  volumen: "volumen_peso_neto",
  
  // Campos específicos - HOGAR
  "alto_cm": "alto_cm",
  alto: "alto_cm",
  altura: "alto_cm",
  
  "ancho_cm": "ancho_cm",
  ancho: "ancho_cm",
  width: "ancho_cm",
  
  "profundo_cm": "profundo_cm",
  profundidad: "profundo_cm",
  depth: "profundo_cm",
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
  // Campos obligatorios - validar que existan y no estén vacíos
  const nombre = row.nombre ? String(row.nombre).trim() : '';
  const codigo = row.codigo ? String(row.codigo).trim() : '';
  
  // Validar solo campos realmente obligatorios
  if (!nombre) {
    throw new Error(`NOMBRE* es obligatorio`);
  }
  if (!codigo) {
    throw new Error(`CÓDIGO* es obligatorio`);
  }
  
  // Campos con valores por defecto si no se proporcionan
  const categoria = row.categoria ? String(row.categoria).trim() : 'general';
  const estado = row.estado ? String(row.estado).trim() : 'Disponible';
  const stock = row.stock != null ? Number(row.stock) : 0;
  
  // Convertir precios - son obligatorios
  const precio_costo = row.precio_costo != null ? Number(row.precio_costo) : null;
  const precio_venta = row.precio_venta != null ? Number(row.precio_venta) : null;
  
  if (precio_costo === null || isNaN(precio_costo)) {
    throw new Error(`PRECIO COSTO* es obligatorio y debe ser un número`);
  }
  if (precio_venta === null || isNaN(precio_venta)) {
    throw new Error(`PRECIO VENTA* es obligatorio y debe ser un número`);
  }

  // Conversión mejorada de fechas de Excel
  let fechaVencimiento: Date | null = null;
  if (row.fecha_vencimiento) {
    const val = row.fecha_vencimiento;
    
    // Si es un número (serial date de Excel)
    if (typeof val === 'number') {
      // Excel serial date: días desde 1900-01-01 (con ajuste por bug de Excel)
      const excelEpoch = new Date(1899, 11, 30); // 30 de diciembre de 1899
      fechaVencimiento = new Date(excelEpoch.getTime() + val * 86400000);
    } else if (val instanceof Date) {
      fechaVencimiento = val;
    } else if (typeof val === 'string') {
      fechaVencimiento = new Date(val);
    }
  }

  return {
    // Campos obligatorios
    nombre: nombre,
    codigo: codigo,
    stock: stock,
    precio_costo: precio_costo,
    precio_venta: precio_venta,
    categoria: categoria,
    estado: estado,
    
    // Campos opcionales básicos
    fecha_vencimiento: fechaVencimiento && !isNaN(fechaVencimiento.getTime()) 
      ? fechaVencimiento.toISOString().split('T')[0] 
      : null,
    proveedor_id: row.proveedor_id ? String(row.proveedor_id) : null,
    proveedor_nombre: row.proveedor_nombre ? String(row.proveedor_nombre).trim() : null,
    marca: row.marca ? String(row.marca).trim() : null,
    medida_peso: row.medida_peso ? String(row.medida_peso).trim() : null,
    stock_bajo: row.stock_bajo != null ? Number(row.stock_bajo) || 20 : 20,
    imagen_url: row.imagen_url ? String(row.imagen_url).trim() : null,
    
    // Campos específicos - ROPA/CALZADO
    talla: row.talla ? String(row.talla).trim() : null,
    color: row.color ? String(row.color).trim() : null,
    genero: row.genero ? String(row.genero).trim() : null,
    tipo_tela: row.tipo_tela ? String(row.tipo_tela).trim() : null,
    
    // Campos específicos - TECNOLOGÍA
    garantia_dias: row.garantia_dias != null ? Number(row.garantia_dias) : null,
    detalles_clave: row.detalles_clave ? String(row.detalles_clave).trim() : null,
    especificacion_electrica: row.especificacion_electrica ? String(row.especificacion_electrica).trim() : null,
    
    // Campos específicos - LIBRERÍA
    autor: row.autor ? String(row.autor).trim() : null,
    editorial: row.editorial ? String(row.editorial).trim() : null,
    isbn_ean: row.isbn_ean ? String(row.isbn_ean).trim() : null,
    formato_libro: row.formato_libro ? String(row.formato_libro).trim() : null,
    numero_paginas: row.numero_paginas != null ? Number(row.numero_paginas) : null,
    
    // Campos específicos - MASCOTAS
    tipo_mascota: row.tipo_mascota ? String(row.tipo_mascota).trim() : null,
    
    // Campos específicos - BELLEZA/ASEO
    tono_aroma: row.tono_aroma ? String(row.tono_aroma).trim() : null,
    tipo_piel_cabello: row.tipo_piel_cabello ? String(row.tipo_piel_cabello).trim() : null,
    
    // Campos específicos - ABARROTES
    volumen_peso_neto: row.volumen_peso_neto ? String(row.volumen_peso_neto).trim() : null,
    
    // Campos específicos - HOGAR/MUEBLES
    material: row.material ? String(row.material).trim() : null,
    alto_cm: row.alto_cm != null ? Number(row.alto_cm) : null,
    ancho_cm: row.ancho_cm != null ? Number(row.ancho_cm) : null,
    profundo_cm: row.profundo_cm != null ? Number(row.profundo_cm) : null,
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
    // Crear workbook dinámicamente con TODOS los campos
    const wb = XLSX.utils.book_new();
    
    // Encabezados completos - ordenados por importancia y clasificación
    const headers = [
      // Campos OBLIGATORIOS (marcados con *)
      'NOMBRE*',
      'CÓDIGO*',
      'STOCK*',
      'PRECIO_COSTO*',
      'PRECIO_VENTA*',
      'CATEGORÍA*',
      'ESTADO',
      
      // Campos opcionales básicos
      'FECHA_VENCIMIENTO',
      'PROVEEDOR_ID',
      'PROVEEDOR_NOMBRE',
      'MARCA',
      'MEDIDA_PESO',
      'STOCK_BAJO',
      'IMAGEN_URL',
      
      // ROPA/CALZADO
      'TALLA',
      'COLOR',
      'GÉNERO',
      'TIPO_TELA',
      
      // TECNOLOGÍA
      'GARANTÍA_DÍAS',
      'DETALLES_CLAVE',
      'ESPECIFICACIÓN_ELÉCTRICA',
      
      // LIBRERÍA
      'AUTOR',
      'EDITORIAL',
      'ISBN_EAN',
      'FORMATO_LIBRO',
      'NÚMERO_PÁGINAS',
      
      // MASCOTAS
      'TIPO_MASCOTA',
      
      // BELLEZA/ASEO
      'TONO_AROMA',
      'TIPO_PIEL_CABELLO',
      
      // ABARROTES
      'VOLUMEN_PESO_NETO',
      
      // HOGAR/MUEBLES
      'MATERIAL',
      'ALTO_CM',
      'ANCHO_CM',
      'PROFUNDO_CM',
    ];
    
    // Fila de instrucciones
    const instrucciones = [
      '⚠️ INSTRUCCIONES: Los campos con * son OBLIGATORIOS. Complete según su clasificación de producto.',
      'Ejemplo: Si vende ROPA, complete talla/color/género/tipo_tela. Si vende TECNOLOGÍA, complete garantía/detalles.',
      'Fecha formato: DD/MM/AAAA o AAAA-MM-DD. Estado: Disponible/Agotado. Elimine estas 3 filas antes de importar.',
      ...Array(headers.length - 3).fill('')
    ];
    
    // Ejemplo de producto ROPA
    const ejemploRopa = [
      'Polo Algodón Pima',
      'POLO-001',
      '50',
      '25.00',
      '45.00',
      'ropa',
      'Disponible',
      '',
      '',
      '',
      'Nike',
      'Unidad',
      '10',
      'https://ejemplo.com/imagen.jpg',
      'M',
      'Azul',
      'Unisex',
      'Algodón 100%',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ];
    
    // Ejemplo de producto TECNOLOGÍA
    const ejemploTech = [
      'Mouse Inalámbrico',
      'TECH-001',
      '30',
      '45.00',
      '89.90',
      'tecnología',
      'Disponible',
      '',
      '',
      '',
      'Logitech',
      'Unidad',
      '5',
      'https://ejemplo.com/mouse.jpg',
      '',
      'Negro',
      '',
      '',
      '365',
      '2400 DPI, Bluetooth 5.0, Batería recargable',
      '5V/1A USB-C',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
      '',
    ];
    
    // Crear worksheet con headers y ejemplos
    const ws = XLSX.utils.aoa_to_sheet([
      headers,
      instrucciones,
      ejemploRopa,
      ejemploTech,
    ]);
    
    // Estilizar (ancho de columnas)
    ws['!cols'] = headers.map(() => ({ wch: 20 }));
    
    XLSX.utils.book_append_sheet(wb, ws, 'Productos');
    
    // Descargar
    XLSX.writeFile(wb, 'plantilla_carga_masiva_completa.xlsx');
    
    toast({
      title: "Plantilla descargada",
      description: "Incluye TODOS los campos específicos por clasificación. Los campos con * son obligatorios.",
    });
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(worksheet);
      
      const erroresValidacion: { fila: number; error: string }[] = [];
      const mapped: any[] = [];
      
      // Filtrar filas vacías y las primeras filas de instrucciones
      const filasValidas = (jsonData as any[]).filter((row, idx) => {
        // Saltar filas que son claramente de instrucciones o vacías
        const values = Object.values(row);
        const firstValue = values[0];
        
        // Saltar si es texto de instrucciones
        if (typeof firstValue === 'string') {
          const lower = firstValue.toLowerCase();
          if (lower.includes('instrucciones') || 
              lower.includes('obligatorio') ||
              lower.includes('⚠️') ||
              lower.includes('campo')) {
            return false;
          }
        }
        
        // Mapear y verificar campos obligatorios
        const mapped = mapHeaders(row);
        const tieneNombre = mapped.nombre && String(mapped.nombre).trim() !== '';
        const tieneCodigo = mapped.codigo && String(mapped.codigo).trim() !== '';
        
        // Debe tener al menos nombre Y código
        return tieneNombre && tieneCodigo;
      });
      
      filasValidas.forEach((row, index) => {
        try {
          const sanitized = sanitizeRow(mapHeaders(row));
          mapped.push(sanitized);
        } catch (error: any) {
          erroresValidacion.push({ 
            fila: index + 2, // +2 porque Excel empieza en 1 y hay header
            error: error.message 
          });
        }
      });

      if (erroresValidacion.length > 0) {
        const mensajeError = erroresValidacion
          .slice(0, 5) // Mostrar solo primeros 5 errores
          .map(e => `Fila ${e.fila}: ${e.error}`)
          .join('\n');
        
        toast({
          title: "Errores en el archivo",
          description: `Se encontraron ${erroresValidacion.length} errores:\n${mensajeError}${erroresValidacion.length > 5 ? '\n...' : ''}`,
          variant: "destructive",
        });
        
        // Aún así mostrar los válidos si existen
        if (mapped.length > 0) {
          setPreview(mapped);
          setRawFile(file);
          toast({
            title: "Productos válidos detectados",
            description: `${mapped.length} de ${jsonData.length} productos son válidos y pueden importarse`,
          });
        }
        return;
      }

      setPreview(mapped);
      setRawFile(file);

      toast({
        title: "Archivo cargado",
        description: `Se detectaron ${mapped.length} productos válidos`,
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
          {/* Mensaje prominente animado */}
          <Alert className="bg-blue-50 border-teal-200">
            <AlertCircle className="h-4 w-4 text-teal-600" />
            <AlertDescription className="text-teal-900">
              <strong>¡Importante!</strong> Para mejores resultados, descarga y usa la plantilla oficial de Excel. 
              Incluye todos los campos necesarios con el formato correcto.
            </AlertDescription>
          </Alert>

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
                        {/* Columnas dinámicas según datos disponibles */}
                        {preview.some(p => p.talla) && <th className="text-left p-2">Talla</th>}
                        {preview.some(p => p.color) && <th className="text-left p-2">Color</th>}
                        {preview.some(p => p.genero) && <th className="text-left p-2">Género</th>}
                        {preview.some(p => p.tipo_tela) && <th className="text-left p-2">Tipo Tela</th>}
                        {preview.some(p => p.garantia_dias) && <th className="text-left p-2">Garantía</th>}
                        {preview.some(p => p.autor) && <th className="text-left p-2">Autor</th>}
                        {preview.some(p => p.editorial) && <th className="text-left p-2">Editorial</th>}
                        {preview.some(p => p.isbn_ean) && <th className="text-left p-2">ISBN/EAN</th>}
                        {preview.some(p => p.marca) && <th className="text-left p-2">Marca</th>}
                        {preview.some(p => p.fecha_vencimiento) && <th className="text-left p-2">Vence</th>}
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
                          {preview.some(p => p.talla) && <td className="p-2">{item.talla ?? '-'}</td>}
                          {preview.some(p => p.color) && <td className="p-2">{item.color ?? '-'}</td>}
                          {preview.some(p => p.genero) && <td className="p-2">{item.genero ?? '-'}</td>}
                          {preview.some(p => p.tipo_tela) && <td className="p-2">{item.tipo_tela ?? '-'}</td>}
                          {preview.some(p => p.garantia_dias) && <td className="p-2">{item.garantia_dias ? `${item.garantia_dias}d` : '-'}</td>}
                          {preview.some(p => p.autor) && <td className="p-2">{item.autor ?? '-'}</td>}
                          {preview.some(p => p.editorial) && <td className="p-2">{item.editorial ?? '-'}</td>}
                          {preview.some(p => p.isbn_ean) && <td className="p-2">{item.isbn_ean ?? '-'}</td>}
                          {preview.some(p => p.marca) && <td className="p-2">{item.marca ?? '-'}</td>}
                          {preview.some(p => p.fecha_vencimiento) && <td className="p-2">{item.fecha_vencimiento?.substring(0, 10) ?? "-"}</td>}
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
