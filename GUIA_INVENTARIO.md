# 🚀 GUÍA DE IMPLEMENTACIÓN - MÓDULO DE INVENTARIO MEJORADO

## 📋 RESUMEN DE CAMBIOS IMPLEMENTADOS

### ✅ **1. BASE DE DATOS**
- ✨ **Nueva tabla `mermas`** para registrar pérdidas, productos vencidos, defectuosos, robos, etc.
- 🔄 **Función `calcular_estado_producto()`**: Calcula automáticamente el estado basado en stock y fecha de vencimiento
- ⚡ **Trigger automático**: Actualiza el estado cada vez que cambia el stock, stock_critico, stock_bajo o fecha_vencimiento
- 📊 **Índices optimizados** para búsquedas por vencimiento, estado y mermas

### ✅ **2. BACKEND - API**

#### **Inventario (`/inventory`)**
- ✅ `GET /inventory/products` - Lista con estados calculados automáticamente
- ✅ `POST /inventory` - Crear producto con validación completa
- ✅ `PATCH /inventory/:id` - Actualizar con registro de historial de precios
- ✅ `DELETE /inventory/:id` - Eliminar producto
- ✅ `POST /inventory/import-json` - Importación masiva mejorada con validación

#### **Ventas (`/ventas`)**
- ✅ `POST /ventas` - Crear venta con:
  - ✨ Descuento automático de stock
  - ✨ Actualización automática de estados
  - ✨ Validación de stock disponible
  - ✨ Soporte para ventas fiadas
  - ✨ Transacciones atómicas
- ✅ `GET /ventas` - Listar con filtros
- ✅ `GET /ventas/:id` - Detalle de venta

#### **Mermas (`/mermas`) - NUEVO**
- ✅ `POST /mermas` - Registrar merma y descontar stock
- ✅ `GET /mermas` - Listar con filtros (tipo, fecha, producto)
- ✅ `GET /mermas/estadisticas` - Estadísticas y reportes
- ✅ `GET /mermas/:id` - Detalle de merma
- ✅ `DELETE /mermas/:id` - Eliminar y restaurar stock

### ✅ **3. FRONTEND - MEJORAS**

#### **Vista de Inventario**
- ✅ Tabla simplificada con columnas esenciales
- ✅ Botón "Detalles" con modal expandido que muestra:
  - Imagen del producto
  - Información completa
  - Alertas de vencimiento
  - Ganancia y márgenes
  - Datos del proveedor
- ✅ Modal de edición con todos los campos hidratados correctamente
- ✅ Estados visuales con colores (Disponible, Stock Bajo, Stock Crítico, Vencido)

#### **Carga Masiva**
- ✅ Validación estricta de campos obligatorios (nombre, código, precio_costo, precio_venta)
- ✅ Normalización inteligente de headers (soporta múltiples formatos)
- ✅ Soporte para campos opcionales: proveedor, marca, medida_peso, imagen_url, etc.
- ✅ Mensajes de error detallados por fila
- ✅ Vista previa antes de importar

#### **Control de Mermas - NUEVA PÁGINA**
- ✅ Dashboard con estadísticas de pérdidas
- ✅ Registro de mermas por tipo (vencido, defectuoso, robo, pérdida, daño, otro)
- ✅ Filtros por tipo, fecha y producto
- ✅ Gráficos de pérdidas por tipo
- ✅ Historial completo de mermas
- ✅ Eliminación con restauración de stock

---

## 🔧 INSTRUCCIONES DE INSTALACIÓN Y PRUEBA

### **Paso 1: Levantar Base de Datos con Docker**

```powershell
# Navegar a la carpeta de infraestructura
cd d:\TECSUP\6toCiclo\Tesis\bodegia\infra\docker

# Levantar contenedor de PostgreSQL
docker-compose up -d

# Verificar que el contenedor está corriendo
docker ps
```

La base de datos se iniciará en:
- **Host**: localhost
- **Puerto**: 5432
- **Database**: bodegia
- **Usuario**: postgres
- **Password**: (configurar en docker-compose.yml)

Los scripts de inicialización en `infra/db/init/` se ejecutarán automáticamente:
1. `01_schema.sql` - Crea tablas, funciones y triggers
2. `02_seed.sql` - Datos de prueba (si existe)

### **Paso 2: Levantar API Backend**

```powershell
# Navegar a la carpeta de servicios
cd d:\TECSUP\6toCiclo\Tesis\bodegia\services\api

# Instalar dependencias (si no lo has hecho)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El backend estará disponible en: **http://localhost:3000**

### **Paso 3: Levantar Frontend**

```powershell
# Abrir nueva terminal
# Navegar a la carpeta web
cd d:\TECSUP\6toCiclo\Tesis\bodegia\apps\web

# Instalar dependencias (si no lo has hecho)
npm install

# Ejecutar en modo desarrollo
npm run dev
```

El frontend estará disponible en: **http://localhost:5173**

---

## 🧪 PRUEBAS DEL SISTEMA

### **Prueba 1: Crear Producto con Todos los Campos**

1. Ir a **Inventario**
2. Click en "Agregar Producto"
3. Completar todos los campos:
   - Nombre, código, stock inicial
   - Precios de costo y venta
   - Proveedor (seleccionar de lista)
   - Fecha de vencimiento
   - Marca y medida/peso
   - Stock crítico: 10
   - Stock bajo: 20
   - Imagen (opcional)
   - Categoría

4. Verificar que se crea correctamente y el estado se calcula automáticamente

### **Prueba 2: Carga Masiva con Excel**

1. Ir a **Inventario** → "Carga Masiva"
2. Descargar plantilla
3. Llenar con datos de prueba (asegurarse de incluir campos obligatorios)
4. Subir archivo
5. Verificar vista previa
6. Importar
7. Verificar que los productos se crearon correctamente con estados calculados

### **Prueba 3: Estados Automáticos**

#### **A. Por Stock:**
- Crear producto con stock = 5
- Verificar estado = "Stock Crítico" (< 10)
- Editar stock = 15
- Verificar estado = "Stock Bajo" (entre 10-20)
- Editar stock = 50
- Verificar estado = "Disponible" (> 20)

#### **B. Por Vencimiento:**
- Crear producto con fecha vencimiento en 3 días
- Verificar estado = "Stock Crítico"
- Crear producto con fecha vencimiento ayer
- Verificar estado = "Vencido"

### **Prueba 4: Ventas y Descuento de Stock**

1. Ir a **POS** (Punto de Venta)
2. Agregar productos al carrito
3. Crear venta (Cobrado o Fiado)
4. Ir a **Inventario**
5. Verificar que:
   - El stock se descontó automáticamente
   - Los estados se actualizaron si corresponde

### **Prueba 5: Control de Mermas**

1. Ir a **Control de Mermas** (nueva página)
2. Click en "Registrar Merma"
3. Seleccionar producto
4. Elegir tipo de merma (vencido, defectuoso, etc.)
5. Ingresar cantidad
6. Agregar motivo
7. Registrar
8. Verificar que:
   - La merma se registró
   - El stock se descontó
   - Las estadísticas se actualizaron
9. Ir a Inventario y verificar que el producto tiene menos stock

### **Prueba 6: Modal de Detalles**

1. En **Inventario**, click en el botón "ojo" (Ver detalles)
2. Verificar que aparece toda la información:
   - Imagen
   - Datos completos
   - Precios y ganancia
   - Alertas de vencimiento
   - Proveedor
   - Fechas de registro

### **Prueba 7: Edición de Producto**

1. En **Inventario**, click en "Editar" (lápiz)
2. Verificar que todos los campos se cargan con los datos existentes
3. Modificar algunos campos
4. Guardar
5. Verificar que los cambios se aplicaron correctamente

---

## 📊 LÓGICA DE ESTADOS

El sistema calcula automáticamente los estados según esta lógica:

```
SI tiene fecha_vencimiento:
  SI ya venció (fecha <= hoy):
    → "Vencido"
  SI vence en ≤ 7 días:
    → "Stock Crítico"

SI stock = 0:
  → "Agotado"
SI stock ≤ stock_critico (default 10):
  → "Stock Crítico"
SI stock ≤ stock_bajo (default 20):
  → "Stock Bajo"
SINO:
  → "Disponible"
```

---

## 📁 ARCHIVOS MODIFICADOS Y CREADOS

### **Base de Datos:**
- ✏️ `infra/db/init/01_schema.sql` - Tabla mermas, función y trigger

### **Backend:**
- ✏️ `services/api/src/routes/inventory.ts` - CRUD completo con estados
- ✏️ `services/api/src/routes/ventas.ts` - Descuento automático de stock
- ✨ `services/api/src/routes/mermas.ts` - API completa de mermas
- ✏️ `services/api/src/index.ts` - Registro de ruta /mermas

### **Frontend - Servicios:**
- ✏️ `apps/web/src/services/inventory.ts` - Tipos actualizados
- ✨ `apps/web/src/services/mermas.ts` - Servicio de mermas

### **Frontend - Componentes:**
- ✏️ `apps/web/src/components/modals/ProductoModal.tsx` - Todos los campos
- ✏️ `apps/web/src/components/modals/CargaMasivaModal.tsx` - Validación mejorada
- ✨ `apps/web/src/components/modals/DetalleProductoModal.tsx` - Modal de detalles
- ✨ `apps/web/src/components/modals/RegistrarMermaModal.tsx` - Modal de mermas

### **Frontend - Páginas:**
- ✏️ `apps/web/src/pages/Inventario.tsx` - Tabla simplificada + botón detalles
- ✨ `apps/web/src/pages/ControlMermas.tsx` - Página completa de mermas

### **Frontend - Hooks:**
- ✏️ `apps/web/src/hooks/useInventario.tsx` - Lógica de estados (fallback)

---

## 🎯 FUNCIONALIDADES COMPLETADAS

✅ **1. Proveedores en CRUD de inventario**
✅ **2. Fecha de vencimiento con alertas visuales**
✅ **3. Marca y medida/peso**
✅ **4. Sistema de mermas completo (vencidos, defectuosos, pérdidas)**
✅ **5. Flujo automático de vencimiento con estados**
✅ **6. Historial de mermas con reportes**
✅ **7. Descuento automático de stock en ventas**
✅ **8. Estados automáticos (Disponible/Stock Bajo/Stock Crítico/Vencido)**
✅ **9. Umbrales personalizados (stock_critico, stock_bajo)**
✅ **10. Carga masiva mejorada con validación inteligente**
✅ **11. Soporte para imagen en Excel (campo imagen_url)**
✅ **12. Modal de detalles con información completa**
✅ **13. Tabla organizada (solo campos esenciales)**
✅ **14. Hidratación correcta en edición**
✅ **15. Clasificación automática de stock**

---

## 🔄 FLUJO COMPLETO DEL SISTEMA

```
1. CREAR PRODUCTO
   ↓
   Trigger calcula estado automáticamente
   ↓
   Producto guardado con estado correcto

2. REALIZAR VENTA
   ↓
   Validar stock disponible
   ↓
   Crear venta en BD
   ↓
   Descontar stock (UPDATE productos)
   ↓
   Trigger recalcula estado
   ↓
   Stock y estado actualizados

3. REGISTRAR MERMA
   ↓
   Validar stock disponible
   ↓
   Crear registro de merma
   ↓
   Descontar stock (UPDATE productos)
   ↓
   Trigger recalcula estado
   ↓
   Stock actualizado + pérdida registrada

4. REPORTES Y ESTADÍSTICAS
   ↓
   Consultar mermas por tipo/fecha
   ↓
   Generar gráficos de pérdidas
   ↓
   Identificar productos críticos
```

---

## 🐛 TROUBLESHOOTING

### **Error: No se puede conectar a la base de datos**
```powershell
# Verificar que el contenedor está corriendo
docker ps

# Ver logs del contenedor
docker logs <container_id>

# Reiniciar contenedor
docker-compose restart
```

### **Error: Puerto 5432 ya está en uso**
```powershell
# Cambiar puerto en docker-compose.yml
ports:
  - "5433:5432"  # Usar puerto 5433 en host
```

### **Error: Triggers no se ejecutan**
```sql
-- Conectar a PostgreSQL y ejecutar:
SELECT * FROM pg_trigger WHERE tgname = 'trigger_actualizar_estado';

-- Si no existe, ejecutar manualmente el script 01_schema.sql
```

---

## 📞 SOPORTE

Si encuentras algún problema:
1. Revisa los logs del backend (terminal de API)
2. Revisa los logs del frontend (terminal de Web)
3. Revisa la consola del navegador (F12)
4. Verifica que la base de datos tiene los triggers y funciones creadas

---

**¡Todo el sistema está listo para usar! 🎉**
