/*import { useState } from 'react';
import { login } from '@/services/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      console.log('Logged as', user);
      // TODO: redirigir, ej: navigate('/dashboard')
    } catch (e: any) {
      setErr(e.message ?? 'Error');
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-3 p-4">
      <h1 className="text-xl font-semibold">Iniciar sesión</h1>
      {err && <p className="text-red-600 text-sm">{err}</p>}
      <input
        className="border rounded w-full p-2"
        type="email"
        value={email}
        onChange={e=>setEmail(e.target.value)}
        placeholder="email@dominio.com"
        required
      />
      <input
        className="border rounded w-full p-2"
        type="password"
        value={password}
        onChange={e=>setPassword(e.target.value)}
        placeholder="••••••••"
        required
      />
      <button
        disabled={loading}
        className="bg-black text-white px-4 py-2 rounded w-full disabled:opacity-60"
      >
        {loading ? 'Ingresando…' : 'Entrar'}
      </button>
    </form>
  );
}
*/