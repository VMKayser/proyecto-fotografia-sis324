/**
 * 📌 Panel de Admin - Gestión de Fotógrafos Destacados
 * Permite al admin destacar fotógrafos o que los fotógrafos paguen para destacarse
 */

'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Card, Input } from '@/components';
import { useAuth } from '@/hooks';

interface Photographer {
  id: number;
  usuarioId: number;
  nombrePublico: string | null;
  ubicacion: string | null;
  calificacionPromedio: number;
  totalResenas: number;
  verificado: boolean;
  destacadoHasta: string | null;
  usuario: {
    nombreCompleto: string;
    email: string;
  };
}

export default function DestacadosAdminPage() {
  const router = useRouter();
  const { user, loading, token } = useAuth();
  const [photographers, setPhotographers] = useState<Photographer[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [processing, setProcessing] = useState<number | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.rol !== 'ADMIN')) {
      router.push('/login');
    }
  }, [user, loading, router]);

  useEffect(() => {
    if (user?.rol === 'ADMIN') {
      fetchPhotographers();
    }
  }, [user]);

  const fetchPhotographers = async () => {
    try {
      setLoadingData(true);
      setError(null);
      const response = await fetch('/api/profiles');
      
      if (!response.ok) throw new Error('Error al cargar fotógrafos');
      
      const data = await response.json();
      setPhotographers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoadingData(false);
    }
  };

  const handleDestacar = async (profileId: number, dias: number) => {
    if (!token) {
      setError('No hay sesión activa');
      return;
    }

    try {
      setProcessing(profileId);
      setError(null);

      const fechaHasta = new Date();
      fechaHasta.setDate(fechaHasta.getDate() + dias);

      const response = await fetch(`/api/profiles/${profileId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destacadoHasta: fechaHasta.toISOString(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al destacar fotógrafo');
      }

      await fetchPhotographers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const handleQuitarDestacado = async (profileId: number) => {
    if (!token) {
      setError('No hay sesión activa');
      return;
    }

    try {
      setProcessing(profileId);
      setError(null);

      const response = await fetch(`/api/profiles/${profileId}/update`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          destacadoHasta: null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al quitar destacado');
      }

      await fetchPhotographers();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setProcessing(null);
    }
  };

  const isDestacado = (destacadoHasta: string | null) => {
    if (!destacadoHasta) return false;
    return new Date(destacadoHasta) > new Date();
  };

  const getDiasRestantes = (destacadoHasta: string | null) => {
    if (!destacadoHasta) return 0;
    const fecha = new Date(destacadoHasta);
    const ahora = new Date();
    const diff = fecha.getTime() - ahora.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  const filteredPhotographers = photographers.filter((p) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      p.nombrePublico?.toLowerCase().includes(searchLower) ||
      p.usuario.nombreCompleto.toLowerCase().includes(searchLower) ||
      p.usuario.email.toLowerCase().includes(searchLower) ||
      p.ubicacion?.toLowerCase().includes(searchLower)
    );
  });

  if (loading || (user?.rol === 'ADMIN' && loadingData)) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-slate-600">Cargando panel de administración...</p>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== 'ADMIN') {
    return null;
  }

  return (
    <div className="min-h-screen bg-slate-50 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900">Gestión de Fotógrafos Destacados</h1>
          <p className="text-slate-600 mt-2">
            Administra qué fotógrafos aparecen destacados en la página principal
          </p>
        </div>

        {error && (
          <Card className="mb-6 bg-red-50 border-red-200">
            <div className="p-4">
              <p className="text-red-600">{error}</p>
            </div>
          </Card>
        )}

        <Card className="mb-6">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Precios de Destacados</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
                <p className="text-2xl font-bold text-blue-600">Bs 100</p>
                <p className="text-sm text-slate-600 mt-1">Por 7 días destacado</p>
              </div>
              <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                <p className="text-2xl font-bold text-purple-600">Bs 350</p>
                <p className="text-sm text-slate-600 mt-1">Por 30 días destacado</p>
              </div>
              <div className="p-4 bg-amber-50 rounded-lg border border-amber-200">
                <p className="text-2xl font-bold text-amber-600">Bs 1000</p>
                <p className="text-sm text-slate-600 mt-1">Por 90 días destacado</p>
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <div className="p-6">
            <div className="mb-6">
              <Input
                label="Buscar fotógrafo"
                placeholder="Nombre, email, ubicación..."
                value={searchTerm}
                onChange={setSearchTerm}
              />
            </div>

            <div className="space-y-4">
              {filteredPhotographers.map((photographer) => {
                const destacado = isDestacado(photographer.destacadoHasta);
                const diasRestantes = getDiasRestantes(photographer.destacadoHasta);

                return (
                  <div
                    key={photographer.id}
                    className={`p-4 rounded-lg border ${
                      destacado
                        ? 'bg-amber-50 border-amber-200'
                        : 'bg-white border-slate-200'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                      <div className="flex-grow">
                        <div className="flex items-center gap-2">
                          <h3 className="text-lg font-semibold text-slate-900">
                            {photographer.nombrePublico || photographer.usuario.nombreCompleto}
                          </h3>
                          {photographer.verificado && (
                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs font-medium rounded-full">
                              ✓ Verificado
                            </span>
                          )}
                          {destacado && (
                            <span className="px-2 py-0.5 bg-amber-100 text-amber-700 text-xs font-medium rounded-full">
                              ⭐ Destacado
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600 mt-1">
                          {photographer.usuario.email} • {photographer.ubicacion || 'Sin ubicación'}
                        </p>
                        <div className="flex items-center gap-4 mt-2">
                          <span className="text-sm text-slate-500">
                            ⭐ {photographer.calificacionPromedio.toFixed(1)} ({photographer.totalResenas} reseñas)
                          </span>
                          {destacado && (
                            <span className="text-sm font-medium text-amber-600">
                              {diasRestantes} días restantes
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {destacado ? (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuitarDestacado(photographer.id)}
                            disabled={processing === photographer.id}
                          >
                            {processing === photographer.id ? 'Procesando...' : 'Quitar destacado'}
                          </Button>
                        ) : (
                          <>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDestacar(photographer.id, 7)}
                              disabled={processing === photographer.id}
                            >
                              7 días
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDestacar(photographer.id, 30)}
                              disabled={processing === photographer.id}
                            >
                              30 días
                            </Button>
                            <Button
                              variant="primary"
                              size="sm"
                              onClick={() => handleDestacar(photographer.id, 90)}
                              disabled={processing === photographer.id}
                            >
                              90 días
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}

              {filteredPhotographers.length === 0 && (
                <div className="text-center py-12 text-slate-500">
                  No se encontraron fotógrafos con ese criterio de búsqueda
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
