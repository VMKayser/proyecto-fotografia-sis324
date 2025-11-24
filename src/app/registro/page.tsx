/**
 * 🌐 Página de Registro
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { Card } from '@/frontend/components/ui';
import { RegisterForm } from '@/frontend/components/auth';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="grid lg:grid-cols-2 min-h-screen">
        {/* Sección izquierda - Simple */}
        <div className="hidden lg:flex flex-col justify-center p-16 bg-gradient-to-br from-indigo-600 to-indigo-700">
          <div className="max-w-md">
            <h1 className="text-5xl font-bold text-white mb-6">
              Únete a FotoBolivia
            </h1>
            <p className="text-indigo-100 text-lg leading-relaxed mb-8">
              Forma parte de la comunidad de fotografía más grande de Bolivia.
            </p>

            <div className="space-y-6">
              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">🎯 Para Clientes</h3>
                <p className="text-indigo-100 text-sm">
                  Encuentra y reserva fotógrafos profesionales
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <h3 className="text-white font-bold mb-2">📸 Para Fotógrafos</h3>
                <p className="text-indigo-100 text-sm">
                  Gestiona tu portafolio y consigue más clientes
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Sección derecha - Formulario */}
        <div className="flex items-center justify-center p-8">
          <div className="w-full max-w-md space-y-8">
            <div>
              <h2 className="text-3xl font-bold text-slate-900">Crear Cuenta</h2>
              <p className="text-slate-600 mt-2">
                Completa tus datos para registrarte
              </p>
            </div>

            <Card className="shadow-lg">
              <RegisterForm />

              <div className="mt-6 text-center">
                <p className="text-sm text-slate-600">
                  ¿Ya tienes cuenta?{' '}
                  <Link href="/login" className="text-blue-600 hover:text-blue-700 font-semibold">
                    Inicia sesión
                  </Link>
                </p>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
