import { useEffect, useState } from 'react';
import { User, getCurrentUser } from '../services/auth';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const u = getCurrentUser();
    setUser(u);
    setLoading(false);
  }, []);

  return { user, loading, isAdmin: user?.role === 'admin', isVendedor: user?.role === 'vendedor' };
}
