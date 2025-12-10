import { useEffect, useState } from 'react';
import { http } from '@/lib/api';

export type Usuario = {
  id: string;
  email: string;
  nombre: string;
  role: string;
  activo: boolean;
  created_at: string;
};

export function useUsuarios() {
  const [usuarios, setUsuarios] = useState<Usuario[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUsuarios = async () => {
    setLoading(true);
    try {
      const data = await http.get<Usuario[]>('/usuarios');
      setUsuarios(data);
      setError(null);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const crearUsuario = async (email: string, nombre: string, password: string, role: string = 'vendedor') => {
    try {
      const usuario = await http.post<Usuario>('/usuarios', { email, nombre, password, role });
      setUsuarios([usuario, ...usuarios]);
      return usuario;
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const editarUsuario = async (id: string, nombre?: string, activo?: boolean) => {
    try {
      const usuario = await http.patch<Usuario>(`/usuarios/${id}`, { nombre, activo });
      setUsuarios(usuarios.map(u => u.id === id ? usuario : u));
      return usuario;
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  const eliminarUsuario = async (id: string) => {
    try {
      await http.delete(`/usuarios/${id}`);
      setUsuarios(usuarios.filter(u => u.id !== id));
    } catch (e: any) {
      throw new Error(e.message);
    }
  };

  useEffect(() => {
    fetchUsuarios();
  }, []);

  return { usuarios, loading, error, crearUsuario, editarUsuario, eliminarUsuario, refetch: fetchUsuarios };
}
