# Implementación de Vendedores y Control de Acceso — Bodegia

## Resumen
Se ha implementado un sistema de autenticación basado en JWT y roles (`admin` | `vendedor`) que controla el acceso a diferentes partes del sistema. Los vendedores pueden crear/registrar ventas y ver inventario, pero no pueden acceder a funciones administrativas.

## Cambios Implementados

### Backend (`services/api/`)

#### 1. **Base de Datos**
- **`infra/db/init/06_users_vendedores.sql`**
  - Tabla `usuarios` con campos: `id`, `email`, `password_hash`, `nombre`, `role`, `activo`, timestamps.
  - Índice en `email` para búsquedas rápidas.

- **`infra/db/init/07_ventas_vendedor.sql`**
  - Añade columna `vendedor_id` a tabla `ventas` (referencia a `usuarios`).
  - Índice en `vendedor_id` para consultas de ventas por vendedor.

#### 2. **Autenticación**
- **`services/api/src/middleware/auth.ts`**
  - `requireAuth`: middleware que valida JWT y adjunta usuario a `req.user`.
  - `requireRole(...roles)`: middleware que verifica si el usuario tiene un rol permitido.
  - `signToken(payload)`: genera JWT con expiración de 8 horas.

- **`services/api/src/routes/auth.ts`**
  - `POST /auth/login`: valida credenciales, hashea contraseña con bcryptjs, devuelve token + datos usuario.
  - `GET /auth/me`: devuelve info del usuario autenticado (solo lee JWT, sin BD).

#### 3. **Protección de Rutas**
Las siguientes rutas ahora requieren `requireAuth` + `requireRole('admin')`:
- **`POST /inventory`** — crear productos
- **`PATCH /inventory/:id`** — editar productos
- **`DELETE /inventory/:id`** — eliminar productos
- **`POST /inventory/import-json`** — importar masivo
- **`POST /proveedores`** — crear proveedores
- **`PATCH /proveedores/:id`** — editar proveedores
- **`POST /compras-proveedores`** — crear compras
- **`POST /mermas`** — registrar mermas
- **`PUT /mermas/:id`** — editar mermas
- **`DELETE /mermas/:id`** — eliminar mermas

Las siguientes rutas protegidas por `requireAuth` (sin restricción de rol):
- **`POST /ventas`** — crear ventas (registra `vendedor_id` automáticamente).

#### 4. **Dependencias Nuevas**
- `bcryptjs@^2.4.3` — hash seguro de contraseñas.
- `jsonwebtoken@^9.0.2` — generación/validación JWT.
- Types: `@types/jsonwebtoken` y `@types/bcryptjs`.

#### 5. **Seed de Admin**
- **`services/api/src/scripts/seed_admin.ts`**
  - Script que crea un usuario admin inicial.
  - Lee credenciales desde variables de entorno:
    - `SEED_ADMIN_EMAIL` (default: `admin@local`)
    - `SEED_ADMIN_PASSWORD` (default: `admin123`)
    - `SEED_ADMIN_NAME` (default: `Admin`)
  - Se ejecuta con: `npm run seed:admin`

### Frontend (`apps/web/`)

#### 1. **Autenticación**
- **`apps/web/src/services/auth.ts`** (actualizado)
  - `User` tipo ahora incluye `role?: string`.
  - `login()` guarda token y datos del usuario en `localStorage`.
  - `me()` ahora devuelve user + role desde JWT.
  - `logout()` limpia token y datos locales.
  - `getCurrentUser()` helper para leer usuario guardado.

#### 2. **Hooks y Componentes de Control de Acceso**
- **`apps/web/src/hooks/useAuth.tsx`** (nuevo)
  - Hook `useAuth()` que devuelve:
    - `user`: datos del usuario o null.
    - `loading`: estado de carga.
    - `isAdmin`, `isVendedor`: helpers para chequear rol.

- **`apps/web/src/components/ProtectByRole.tsx`** (nuevo)
  - Componente wrapper `<ProtectByRole roles={['admin']} />`.
  - Renderiza hijos solo si usuario tiene uno de los roles indicados.

#### 3. **Menú Dinámico (Sidebar)**
- **`apps/web/src/components/Sidebar.tsx`** (actualizado)
  - Menú diferenciado por rol:
    - **Admin**: Dashboard, Inventario, Reportes, Reportes SUNAT, Proveedores, Vendedores, Configuración.
    - **Vendedor**: Punto de Venta, Inventario (lectura), Fiados.
  - Subtítulo dinámico ("Administrador" / "Vendedor").
  - No renderiza menú mientras carga (`loading`).

#### 4. **API Helper**
- **`apps/web/src/lib/api.ts`** (sin cambios, pero ya funcional)
  - Adjunta token JWT automáticamente a todas las requests.
  - Busca token en `localStorage.getItem('token')`.

## Variables de Entorno Necesarias

### Backend
```env
DATABASE_URL=postgresql://user:pass@localhost:5432/bodegia
JWT_SECRET=tu_secreto_muy_seguro_aqui
SEED_ADMIN_EMAIL=admin@empresa.com
SEED_ADMIN_PASSWORD=contraseña_segura_123
SEED_ADMIN_NAME=Admin Principal
```

## Flujo de Login

1. Usuario ingresa email/contraseña en pantalla de login.
2. Frontend hace `POST /auth/login` con credenciales.
3. Backend:
   - Valida email existe en `usuarios`.
   - Compara contraseña hashada con bcryptjs.
   - Si OK, genera JWT con payload `{ id, email, role }`.
4. Frontend recibe token + datos usuario.
5. Guarda token en `localStorage`.
6. **En cualquier request siguiente**, token se envía en header `Authorization: Bearer <token>`.
7. Middleware `requireAuth` valida JWT.
8. Middleware `requireRole` verifica acceso según rol.

## Próximos Pasos Sugeridos (Opcional)

1. **Crear página de Gestión de Vendedores** (solo admin):
   - Listar, crear, editar, deshabilitar usuarios.
   - Asignar contraseña temporal.

2. **Auditoría**: registrar quién creó/editó cada venta y cambio de inventario:
   - Agregar `created_by` / `updated_by` en tablas clave.

3. **Cambio de Contraseña**: endpoint para que usuarios cambien su propia contraseña.

4. **Recuperación de Contraseña**: flujo de reset.

5. **Validaciones Frontend**: mostrar errores 403/401 amigables.

6. **Tests**: validar que vendedores no pueden POST a rutas admin.

## Prueba Rápida

### 1. Ejecutar migraciones
```bash
cd c:\Users\Jean\Desktop\TESIS\bodegia
# Asegurar BD conectada
```

### 2. Crear admin
```bash
cd services/api
npm install  # instalar bcryptjs, jsonwebtoken
npm run seed:admin
```

### 3. Login desde frontend
- Ir a página de login.
- Email: `admin@local`, Contraseña: `admin123` (o lo que hayas puesto en env).
- Si OK, se guarda token y redirige a dashboard.

### 4. Crear vendedor
- (Aún no hay UI, pero podrías crear manual en BD):
  ```sql
  INSERT INTO usuarios(email, password_hash, nombre, role, activo)
  VALUES('vendedor@test.com', '[hash_bcrypt]', 'Juan Vendedor', 'vendedor', true);
  ```
- Login con ese vendedor → ve solo POS, Inventario, Fiados.
- Si intenta POST a `/inventory` → error 403.

---

**Nota**: Recuerda que los cambios en migraciones requieren ejecutar `docker-compose down && docker-compose up -d --build` para reiniciar la BD con los nuevos esquemas.
