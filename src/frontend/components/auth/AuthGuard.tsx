/**
 * ⚛️ Componente AuthGuard
 * Protege rutas que requieren autenticación
 */

'use client';

import React, { useEffect, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../repositories';
import { RolUsuario } from '../../interfaces';

interface AuthGuardProps {
  children: ReactNode;
  requireAuth?: boolean;
  requiredRole?: RolUsuario;
  redirectTo?: string;
}

export function AuthGuard({
  children,
  requireAuth = true,
  requiredRole,
  redirectTo = '/login',
}: AuthGuardProps) {
  const { user, loading, isAuthenticated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      // Si requiere autenticación y no está autenticado
      if (requireAuth && !isAuthenticated) {
        router.push(redirectTo);
        return;
      }

      // Si requiere un rol específico y el usuario no lo tiene
      if (requiredRole && user && user.rol !== requiredRole) {
        router.push('/unauthorized');
        return;
      }
    }
  }, [user, loading, isAuthenticated, requireAuth, requiredRole, redirectTo, router]);

  // Mostrar loading mientras se verifica
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  // Si requiere auth pero no está autenticado, no mostrar nada (se está redirigiendo)
  if (requireAuth && !isAuthenticated) {
    return null;
  }

  // Si requiere rol pero no lo tiene, no mostrar nada (se está redirigiendo)
  if (requiredRole && user && user.rol !== requiredRole) {
    return null;
  }

  return <>{children}</>;
}
