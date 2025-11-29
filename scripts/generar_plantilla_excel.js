
const XLSX = require('xlsx');
const path = require('path');

// Crear un nuevo workbook
const wb = XLSX.utils.book_new();

// Datos de la plantilla - Solo NOMBRE, CÓDIGO, PRECIO COSTO y PRECIO VENTA son obligatorios
const headers = [
  'NOMBRE*',
  'CÓDIGO*',
  'PRECIO COSTO*',
  'PRECIO VENTA*',
  'CATEGORÍA',
  'STOCK INICIAL',
  'ESTADO',
  'FECHA VENCIMIENTO',
  'MARCA',
  'MEDIDA / PESO',
  'PROVEEDOR NOMBRE',
  'PROVEEDOR ID / RUC',
  'URL IMAGEN',
  'STOCK BAJO'
];

const instruccion1 = '⚠️ INSTRUCCIONES PARA LA CARGA MASIVA';
const instruccion2 = 'CAMPOS OBLIGATORIOS (con *): NOMBRE, CÓDIGO, PRECIO COSTO y PRECIO VENTA. Los demás campos son opcionales.';
const instruccion3 = 'Si no llenas CATEGORÍA se usará "general", STOCK INICIAL será 0, ESTADO será "Disponible" y STOCK BAJO será 20.';

// Fila de ejemplo con datos de la imagen
const ejemploData = [
  'Aceite Vegetal 1L',  // NOMBRE*
  'ACEI-001',           // CÓDIGO*
  5,                    // PRECIO COSTO*
  6.5,                  // PRECIO VENTA*
  'comestibles',        // CATEGORÍA
  30,                   // STOCK INICIAL
  'Disponible',         // ESTADO
  '10/12/2026',         // FECHA VENCIMIENTO
  'Primor',             // MARCA
  '1 Litro',            // MEDIDA/PESO
  'Distribuidora La Estrella', // PROVEEDOR NOMBRE
  '20123456789',        // PROVEEDOR ID/RUC
  'http://imagen.com/aceite.jpg', // URL IMAGEN
  10                    // STOCK BAJO
];

// Crear worksheet vacío
const ws = {};

// Configurar merges PRIMERO
ws['!merges'] = [
  { s: { r: 0, c: 0 }, e: { r: 0, c: 13 } }, // Fila 1
  { s: { r: 1, c: 0 }, e: { r: 1, c: 13 } }, // Fila 2
  { s: { r: 2, c: 0 }, e: { r: 2, c: 13 } }  // Fila 3
];

// Agregar instrucciones (filas 1-3) con estilo verde
ws['A1'] = { 
  v: instruccion1, 
  t: 's',
  s: {
    fill: { fgColor: { rgb: "10B981" } },
    font: { bold: true, color: { rgb: "FFFFFF" }, sz: 14 },
    alignment: { horizontal: "center", vertical: "center" }
  }
};

ws['A2'] = { 
  v: instruccion2, 
  t: 's',
  s: {
    fill: { fgColor: { rgb: "34D399" } },
    font: { bold: false, color: { rgb: "FFFFFF" }, sz: 11 },
    alignment: { horizontal: "left", vertical: "center", wrapText: true }
  }
};

ws['A3'] = { 
  v: instruccion3, 
  t: 's',
  s: {
    fill: { fgColor: { rgb: "6EE7B7" } },
    font: { italic: true, color: { rgb: "065F46" }, sz: 10 },
    alignment: { horizontal: "left", vertical: "center", wrapText: true }
  }
};

// Fila 4 vacía (ya está vacía por defecto)

// Fila 5: Headers con estilo
headers.forEach((header, idx) => {
  const cellAddress = XLSX.utils.encode_cell({ r: 4, c: idx }); // Fila 5 (índice 4)
  ws[cellAddress] = {
    v: header,
    t: 's',
    s: {
      fill: { fgColor: { rgb: "059669" } },
      font: { bold: true, color: { rgb: "FFFFFF" }, sz: 11 },
      alignment: { horizontal: "center", vertical: "center" },
      border: {
        top: { style: "thin", color: { rgb: "000000" } },
        bottom: { style: "thin", color: { rgb: "000000" } },
        left: { style: "thin", color: { rgb: "000000" } },
        right: { style: "thin", color: { rgb: "000000" } }
      }
    }
  };
});

// Fila 6: Ejemplo de datos
ejemploData.forEach((value, idx) => {
  const cellAddress = XLSX.utils.encode_cell({ r: 5, c: idx }); // Fila 6 (índice 5)
  ws[cellAddress] = {
    v: value,
    t: typeof value === 'number' ? 'n' : 's'
  };
});

// Configurar rango de la hoja
ws['!ref'] = XLSX.utils.encode_range({ s: { r: 0, c: 0 }, e: { r: 5, c: 13 } });

// Configurar anchos de columna
ws['!cols'] = [
  { wch: 20 },  // NOMBRE
  { wch: 15 },  // CÓDIGO
  { wch: 15 },  // PRECIO COSTO
  { wch: 15 },  // PRECIO VENTA
  { wch: 15 },  // CATEGORÍA
  { wch: 15 },  // STOCK INICIAL
  { wch: 12 },  // ESTADO
  { wch: 18 },  // FECHA VENCIMIENTO
  { wch: 15 },  // MARCA
  { wch: 15 },  // MEDIDA/PESO
  { wch: 25 },  // PROVEEDOR NOMBRE
  { wch: 18 },  // PROVEEDOR ID/RUC
  { wch: 30 },  // URL IMAGEN
  { wch: 12 }   // STOCK BAJO
];

// Configurar altura de las filas de instrucciones
ws['!rows'] = [
  { hpt: 30 },  // Fila 1 - Título principal
  { hpt: 35 },  // Fila 2 - Instrucciones detalladas
  { hpt: 35 },  // Fila 3 - Recomendación
  { hpt: 5 },   // Fila 4 - Vacía
  { hpt: 25 },  // Fila 5 - Headers
  { hpt: 20 }   // Fila 6 - Ejemplo
];

// Agregar worksheet al workbook
XLSX.utils.book_append_sheet(wb, ws, 'Productos');

// Ruta de salida
const outputPath = path.join(__dirname, '..', 'apps', 'web', 'public', 'plantilla_carga_masiva.xlsx');

// Guardar archivo
XLSX.writeFile(wb, outputPath);

console.log('✅ Plantilla generada exitosamente en:', outputPath);
console.log('📋 Incluye:');
console.log('   - Instrucciones claras en las primeras 3 filas');
console.log('   - Headers con campos obligatorios marcados con *');
console.log('   - Ejemplo con datos del producto "Aceite Vegetal 1L"');
console.log('   - Columnas configuradas con anchos apropiados');
