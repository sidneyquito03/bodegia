import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login } from '@/services/auth';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const navigate = useNavigate();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      const user = await login({ email, password });
      console.log('Logged as', user);
      // El login ya guarda en localStorage, espera un tick y redirige
      setTimeout(() => {
        navigate('/');
      }, 100);
    } catch (e: any) {
      setErr(e.message ?? 'Error de autenticación');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/10 to-primary-light/10">
      <form onSubmit={onSubmit} className="max-w-sm mx-auto space-y-4 p-8 bg-card rounded-lg shadow-lg border border-border">
        <h1 className="text-2xl font-bold text-center">Bodegia</h1>
        <p className="text-center text-muted-foreground text-sm">Ingresa a tu cuenta</p>
        
        {err && <p className="text-red-600 text-sm bg-red-50 p-3 rounded">{err}</p>}
        
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            className="border border-border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            type="email"
            value={email}
            onChange={e=>setEmail(e.target.value)}
            placeholder="admin@bodegia.local"
            required
          />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Contraseña</label>
          <input
            className="border border-border rounded w-full p-2 focus:outline-none focus:ring-2 focus:ring-primary"
            type="password"
            value={password}
            onChange={e=>setPassword(e.target.value)}
            placeholder="••••••••"
            required
          />
        </div>
        
        <button
          disabled={loading}
          className="bg-primary text-primary-foreground px-4 py-2 rounded w-full disabled:opacity-60 font-medium hover:bg-primary/90"
        >
          {loading ? 'Ingresando…' : 'Entrar'}
        </button>
        
        <p className="text-xs text-center text-muted-foreground mt-4">
          Demo: admin@bodegia.local / admin123
        </p>
      </form>
    </div>
  );
}
