import { useState } from 'react';
import { useUsuarios } from '@/hooks/useUsuarios';
import { useAuth } from '@/hooks/useAuth';
import { ProtectByRole } from '@/components/ProtectByRole';
import { Plus, Trash2 } from 'lucide-react';
import { Layout } from '@/components/Layout';

export default function Equipo() {
  const { user, loading: authLoading } = useAuth();
  const { usuarios, loading, error, crearUsuario, editarUsuario, eliminarUsuario } = useUsuarios();
  const [mostrarFormulario, setMostrarFormulario] = useState(false);
  const [formData, setFormData] = useState({ email: '', nombre: '', password: '', role: 'vendedor' });
  const [errForm, setErrForm] = useState<string | null>(null);

  const handleCrear = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrForm(null);
    try {
      if (!formData.email || !formData.nombre || !formData.password) {
        setErrForm('Todos los campos son requeridos');
        return;
      }
      await crearUsuario(formData.email, formData.nombre, formData.password, formData.role);
      setFormData({ email: '', nombre: '', password: '', role: 'vendedor' });
      setMostrarFormulario(false);
    } catch (e: any) {
      setErrForm(e.message);
    }
  };

  const handleToggle = async (id: string, activo: boolean) => {
    try {
      await editarUsuario(id, undefined, !activo);
    } catch (e: any) {
      setErrForm(e.message);
    }
  };

  const handleEliminar = async (id: string) => {
    if (!window.confirm('¿Seguro que quieres eliminar este usuario?')) return;
    try {
      await eliminarUsuario(id);
    } catch (e: any) {
      setErrForm(e.message);
    }
  };

  if (authLoading) return null;

  return (
    <ProtectByRole roles={["admin"]} fallback={<div className="p-8 text-center">No tienes permiso para acceder aquí</div>}>
      <Layout>
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">Gestión de Equipo</h1>
            <p className="text-muted-foreground">Crea y administra vendedores y administradores</p>
          </div>
          <button
            onClick={() => setMostrarFormulario(!mostrarFormulario)}
            className="bg-primary text-primary-foreground px-4 py-2 rounded flex items-center gap-2 hover:bg-primary/90"
          >
            <Plus className="h-5 w-5" /> Nuevo Usuario
          </button>
        </div>

        {error && <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{error}</div>}
        {errForm && <div className="bg-red-50 text-red-600 p-4 rounded mb-6">{errForm}</div>}

        {mostrarFormulario && (
          <form onSubmit={handleCrear} className="bg-card border border-border rounded-lg p-6 mb-6 space-y-4">
            <h2 className="text-xl font-bold">Crear Nuevo Usuario</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <input
                type="email"
                placeholder="Email"
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                className="border border-border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="text"
                placeholder="Nombre"
                value={formData.nombre}
                onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                className="border border-border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <input
                type="password"
                placeholder="Contraseña (min 6 caracteres)"
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
                className="border border-border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
                required
              />
              <select
                value={formData.role}
                onChange={e => setFormData({ ...formData, role: e.target.value })}
                className="border border-border rounded p-2 focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="vendedor">Vendedor</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-primary text-primary-foreground px-4 py-2 rounded hover:bg-primary/90">
                Guardar
              </button>
              <button
                type="button"
                onClick={() => setMostrarFormulario(false)}
                className="bg-muted text-foreground px-4 py-2 rounded hover:bg-muted/80"
              >
                Cancelar
              </button>
            </div>
          </form>
        )}

        {loading ? (
          <div className="text-center py-8">Cargando...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b border-border bg-muted">
                  <th className="text-left p-4 font-bold">Nombre</th>
                  <th className="text-left p-4 font-bold">Email</th>
                  <th className="text-left p-4 font-bold">Rol</th>
                  <th className="text-left p-4 font-bold">Estado</th>
                  <th className="text-left p-4 font-bold">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {usuarios.map(u => (
                  <tr key={u.id} className="border-b border-border hover:bg-muted">
                    <td className="p-4 font-medium">{u.nombre}</td>
                    <td className="p-4 text-muted-foreground text-sm">{u.email}</td>
                    <td className="p-4">
                      <span className={`px-3 py-1 rounded text-xs font-semibold ${u.role === 'admin' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}`}>
                        {u.role === 'admin' ? 'ADMIN' : 'VENDEDOR'}
                      </span>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleToggle(u.id, u.activo)}
                        className={`px-3 py-1 rounded text-xs font-semibold ${u.activo ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                      >
                        {u.activo ? 'ACTIVO' : 'INACTIVO'}
                      </button>
                    </td>
                    <td className="p-4">
                      <button
                        onClick={() => handleEliminar(u.id)}
                        disabled={user?.id === u.id}
                        className="text-red-600 hover:text-red-800 disabled:opacity-50 disabled:cursor-not-allowed"
                        title={user?.id === u.id ? 'No puedes eliminar tu propia cuenta' : 'Eliminar usuario'}
                      >
                        <Trash2 className="h-5 w-5" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {usuarios.length === 0 && (
              <div className="text-center py-8 text-muted-foreground">
                No hay usuarios registrados
              </div>
            )}
          </div>
        )}
      </Layout>
    </ProtectByRole>
  );
}
