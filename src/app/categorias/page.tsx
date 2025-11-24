'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Card } from '@/frontend/components/ui/Card';

interface Categoria {
  id: number;
  nombre: string;
  descripcion: string | null;
  _count?: {
    fotografos: number;
  };
}

const categoryIcons: { [key: string]: string } = {
  'Bodas': '💒',
  'Eventos Corporativos': '🏢',
  'Retratos': '👤',
  'Productos': '📦',
  'Deportes': '⚽',
  'Naturaleza': '🌿',
  'Arquitectura': '🏛️',
  'Moda': '👗',
  'Gastronomía': '🍽️',
  'Infantil': '👶',
  'default': '📸',
};

export default function CategoriasPage() {
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCategorias();
  }, []);

  const fetchCategorias = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/categories');

      if (response.ok) {
        const data = await response.json();
        setCategorias(data);
      }
    } catch (err) {
      console.error('Error al cargar categorías:', err);
    } finally {
      setLoading(false);
    }
  };

  const getIcon = (nombre: string) => {
    return categoryIcons[nombre] || categoryIcons.default;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 py-12">
      <div className="container mx-auto px-4 max-w-6xl">
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Categorías de Fotografía
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Encuentra fotógrafos especializados en diferentes áreas
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Cargando categorías...</p>
          </div>
        ) : categorias.length === 0 ? (
          <Card className="text-center py-12">
            <p className="text-gray-500 text-lg">
              No hay categorías disponibles
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categorias.map((categoria) => (
              <Link
                key={categoria.id}
                href={`/fotografos?categoria=${categoria.id}`}
              >
                <Card className="p-6 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 cursor-pointer h-full">
                  <div className="text-center">
                    <div className="text-6xl mb-4">
                      {getIcon(categoria.nombre)}
                    </div>
                    <h2 className="text-2xl font-bold text-gray-900 mb-3">
                      {categoria.nombre}
                    </h2>
                    {categoria.descripcion && (
                      <p className="text-gray-600 mb-4">
                        {categoria.descripcion}
                      </p>
                    )}
                    {categoria._count && (
                      <p className="text-sm text-blue-600 font-medium">
                        {categoria._count.fotografos} fotógrafo
                        {categoria._count.fotografos !== 1 ? 's' : ''}
                      </p>
                    )}
                  </div>

                  <div className="mt-6 text-center">
                    <span className="text-blue-600 font-medium hover:underline">
                      Ver fotógrafos →
                    </span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        )}

        <div className="mt-16 text-center">
          <Card className="p-8 bg-gradient-to-r from-blue-600 to-purple-600 text-white">
            <h2 className="text-3xl font-bold mb-4">¿Eres Fotógrafo?</h2>
            <p className="text-lg mb-6 opacity-90">
              Únete a nuestra plataforma y ofrece tus servicios
            </p>
            <div className="flex gap-4 justify-center flex-wrap">
              <Link href="/registro">
                <button className="bg-white text-blue-600 px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Crear Cuenta
                </button>
              </Link>
              <Link href="/login">
                <button className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors">
                  Iniciar Sesión
                </button>
              </Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
