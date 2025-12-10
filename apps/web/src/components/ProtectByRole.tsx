import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';

export function ProtectByRole({ children, roles, fallback }: { children: ReactNode; roles: string[]; fallback?: ReactNode }) {
  const { user, loading } = useAuth();
  
  if (loading) return null;
  if (!user) return fallback ?? null;
  if (!roles.includes(user.role ?? '')) return fallback ?? null;
  
  return <>{children}</>;
}
