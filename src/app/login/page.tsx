/**
 * 🌐 Página de Login
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/components';
import { LoginForm } from '@/frontend/components/auth';

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Sección izquierda - Simple y limpia */}
        <div className="hidden lg:flex flex-col justify-center p-16 bg-gradient-to-br from-blue-600 to-blue-700">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-6">
              Bienvenido a FotoBolivia
            </h1>
            <p className="text-blue-100 text-lg leading-relaxed">
              La plataforma que conecta fotógrafos profesionales con clientes en Bolivia.
            </p>

            <div className="mt-12 space-y-4">
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">✓</div>
                <p>Fotógrafos verificados</p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">✓</div>
                <p>Reservas en línea</p>
              </div>
              <div className="flex items-center gap-3 text-white">
                <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center">✓</div>
                <p>Pagos seguros</p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección derecha - Formulario */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Iniciar Sesión</h2>
              <p className="text-slate-600 mt-2">
                Ingresa tus credenciales para continuar
              </p>
            </div>

            <Card className="shadow-lg">
              <LoginForm />

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  ¿No tienes cuenta?{' '}
                  <Link href="/registro" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Regístrate aquí
                  </Link>
                </p>
              </div>
            </Card>

            {/* Demo users removed for production deployment */}
          </div>
        </div>
      </div>
    </div>
  );
}
