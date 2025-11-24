/**
 * 🦶 Footer - Pie de página
 */

'use client';

import React from 'react';
import Link from 'next/link';

export function Footer() {
  return (
    <footer className="bg-gray-800 text-white mt-16">
      <div className="container mx-auto px-4 py-8">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Sobre Nosotros */}
          <div>
            <h3 className="text-lg font-bold mb-4">📸 FotoBolivia</h3>
            <p className="text-gray-400 text-sm">
              Plataforma líder para conectar fotógrafos profesionales con clientes en Bolivia.
            </p>
          </div>

          {/* Enlaces Rápidos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Enlaces</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/" className="text-gray-400 hover:text-white transition-colors">
                  Inicio
                </Link>
              </li>
              <li>
                <Link href="/fotografos" className="text-gray-400 hover:text-white transition-colors">
                  Fotógrafos
                </Link>
              </li>
              <li>
                <Link href="/categorias" className="text-gray-400 hover:text-white transition-colors">
                  Categorías
                </Link>
              </li>
            </ul>
          </div>

          {/* Para Fotógrafos */}
          <div>
            <h3 className="text-lg font-bold mb-4">Fotógrafos</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/registro" className="text-gray-400 hover:text-white transition-colors">
                  Registrarse
                </Link>
              </li>
              <li>
                <Link href="/login" className="text-gray-400 hover:text-white transition-colors">
                  Iniciar Sesión
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-gray-400 hover:text-white transition-colors">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Contacto */}
          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <ul className="space-y-2 text-sm text-gray-400">
              <li>📧 info@fotobolivia.com</li>
              <li>📱 +591 70000000</li>
              <li>📍 La Paz, Bolivia</li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-700 mt-8 pt-6 text-center text-sm text-gray-400">
          <p>&copy; 2025 FotoBolivia - Todos los derechos reservados | SIS324</p>
        </div>
      </div>
    </footer>
  );
}
