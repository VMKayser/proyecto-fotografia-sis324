/**
 * 🧭 Navbar - Barra de navegación principal
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { Button, NotificationDropdown } from '@/components';

export function Navbar() {
  const { user, logout } = useAuth();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">📸</span>
            <span className="text-xl font-bold text-blue-600">FotoBolivia</span>
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center space-x-6">
            <Link
              href="/"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Inicio
            </Link>
            <Link
              href="/fotografos"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Fotógrafos
            </Link>
            <Link
              href="/categorias"
              className="text-gray-700 hover:text-blue-600 transition-colors"
            >
              Categorías
            </Link>
            {user && (
              <Link
                href="/dashboard"
                className="text-gray-700 hover:text-blue-600 transition-colors"
              >
                Dashboard
              </Link>
            )}
          </div>

          {/* Auth Buttons */}
          <div className="flex items-center space-x-3">
            {user ? (
              <>
                <NotificationDropdown />
                <span className="text-sm text-gray-600 hidden md:block">
                  Hola, <span className="font-semibold">{user.nombreCompleto}</span>
                </span>
                <Link href="/perfil">
                  <Button variant="outline" size="sm">
                    Mi Perfil
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={logout}
                >
                  Salir
                </Button>
              </>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="outline" size="sm">
                    Iniciar Sesión
                  </Button>
                </Link>
                <Link href="/registro">
                  <Button variant="primary" size="sm">
                    Registrarse
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
