'use client';

import React from 'react';
import { Card, Button } from '@/components';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function AdminDashboard() {
  const router = useRouter();

  const cards = [
    {
      title: 'Verificaciones',
      description: 'Aprobar o rechazar fotógrafos',
      href: '/admin/verificaciones',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      color: 'from-blue-500 to-blue-600',
    },
    {
      title: 'Solicitudes Destacados',
      description: 'Revisar pagos de 100 Bs',
      href: '/admin/solicitudes',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      ),
      color: 'from-purple-500 to-purple-600',
    },
    {
      title: 'Gestionar Destacados',
      description: 'Administrar perfiles destacados',
      href: '/admin/destacados',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
        </svg>
      ),
      color: 'from-amber-500 to-orange-600',
    },
    {
      title: 'Usuarios',
      description: 'Ver todos los usuarios del sistema',
      href: '/admin/usuarios',
      icon: (
        <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ),
      color: 'from-emerald-500 to-green-600',
    },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <h1 className="text-3xl font-bold text-slate-900">Panel de Administración</h1>
        <p className="text-slate-600 mt-2">Gestiona todo el sistema desde aquí</p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((card) => (
          <Card 
            key={card.href}
            padding="lg" 
            className={`bg-gradient-to-br ${card.color} text-white hover:shadow-xl transition-all cursor-pointer transform hover:scale-105`} 
            onClick={() => router.push(card.href)}
          >
            <div className="mb-4">{card.icon}</div>
            <h3 className="text-lg font-semibold mb-2">{card.title}</h3>
            <p className="text-sm opacity-90 mb-4">{card.description}</p>
            <div className="text-right">
              <span className="text-xs opacity-75">Click para ir →</span>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card padding="lg" className="bg-white border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            Accesos Rápidos
          </h3>
          <div className="space-y-3">
            {cards.map((card) => (
              <Link 
                key={card.href}
                href={card.href} 
                className="flex items-center justify-between p-4 bg-slate-50 rounded-xl hover:bg-slate-100 transition group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-white shadow-sm flex items-center justify-center group-hover:scale-110 transition">
                    {React.cloneElement(card.icon, { className: 'w-6 h-6 text-slate-700' })}
                  </div>
                  <span className="font-medium text-slate-900">{card.title}</span>
                </div>
                <svg className="w-5 h-5 text-slate-400 group-hover:text-slate-600 group-hover:translate-x-1 transition" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </Card>

        <Card padding="lg" className="bg-white border border-slate-200">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            Funciones Principales
          </h3>
          <div className="space-y-4">
            {cards.map((card, index) => (
              <div key={index} className="flex items-start gap-4 pb-4 border-b border-slate-100 last:border-0">
                <div className="w-10 h-10 rounded-lg bg-slate-100 flex items-center justify-center flex-shrink-0">
                  {React.cloneElement(card.icon, { className: 'w-6 h-6 text-slate-600' })}
                </div>
                <div className="flex-1">
                  <p className="font-semibold text-slate-800">{card.title}</p>
                  <p className="text-sm text-slate-600 mt-1">{card.description}</p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card padding="lg" className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold mb-2">Configuración del Sistema</h3>
            <p className="text-blue-100">Configura el QR de pago para destacados y otras opciones</p>
          </div>
          <Link href="/admin/configuracion">
            <Button className="bg-white text-blue-600 hover:bg-blue-50">
              Ir a Configuración
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
