/**
 * 💾 Context de Autenticación
 * Gestiona el estado global de autenticación
 */

'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { IAuthContext, ILoginDTO, IRegisterDTO, IUsuario } from '../interfaces';
import { Usuario } from '../models';
import { AuthService } from '../services';

const AuthContext = createContext<IAuthContext | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Usuario | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Cargar usuario al montar el componente
  useEffect(() => {
    const initializeAuth = async () => {
      const storedToken = AuthService.getToken();
      const storedUser = AuthService.getStoredUser();

      if (storedToken && storedUser) {
        setToken(storedToken);
        setUser(storedUser);

        // Verificar token con el backend
        try {
          const currentUser = await AuthService.getCurrentUser();
          setUser(currentUser);
        } catch (error) {
          console.error('Token inválido:', error);
          AuthService.logout();
          setUser(null);
          setToken(null);
        }
      }

      setLoading(false);
    };

    initializeAuth();
  }, []);

  const login = async (credentials: ILoginDTO) => {
    setLoading(true);
    try {
      const response = await AuthService.login(credentials);
      setUser(Usuario.fromAPI(response.user));
      setToken(response.token);
    } finally {
      setLoading(false);
    }
  };

  const register = async (data: IRegisterDTO) => {
    setLoading(true);
    try {
      const response = await AuthService.register(data);
      setUser(Usuario.fromAPI(response.user));
      setToken(response.token);
    } finally {
      setLoading(false);
    }
  };

  const logout = () => {
    AuthService.logout();
    setUser(null);
    setToken(null);
  };

  const value: IAuthContext = {
    user: user as IUsuario | null,
    token,
    loading,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isFotografo: user?.esFotografo ?? false,
    isCliente: user?.esCliente ?? false,
    isAdmin: user?.esAdmin ?? false,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): IAuthContext {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider');
  }
  return context;
}
