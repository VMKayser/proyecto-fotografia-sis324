'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/repositories/AuthContext';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/frontend/components/ui';
import Image from 'next/image';

interface Solicitud {
  id: number;
  fotografoId: number;
  dias: number;
  precio: number;
  urlComprobante: string;
  referenciaPago: string | null;
  notasFotografo: string | null;
  estado: 'PENDIENTE' | 'APROBADO' | 'RECHAZADO';
  notasAdmin: string | null;
  createdAt: string;
  fotografo: {
    id: number;
    nombrePublico: string | null;
    usuario: {
      nombreCompleto: string;
      email: string;
    };
  };
}

export default function AdminSolicitudesPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [solicitudes, setSolicitudes] = useState<Solicitud[]>([]);
  const [loading, setLoading] = useState(true);
  const [filtroEstado, setFiltroEstado] = useState<string>('');
  const [procesando, setProcesando] = useState<number | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.rol !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadSolicitudes();
  }, [user, router, filtroEstado]);

  const loadSolicitudes = async () => {
    try {
      const url = filtroEstado
        ? `/api/admin/solicitudes-destacado?estado=${filtroEstado}`
        : '/api/admin/solicitudes-destacado';

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success) {
        setSolicitudes(data.data);
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevisar = async (solicitudId: number, accion: 'APROBAR' | 'RECHAZAR') => {
    const notasAdmin = prompt(
      accion === 'APROBAR'
        ? 'Notas de aprobación (opcional):'
        : 'Motivo del rechazo (opcional):'
    );

    setProcesando(solicitudId);

    try {
      const res = await fetch('/api/admin/solicitudes-destacado', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          solicitudId,
          accion,
          notasAdmin,
        }),
      });

      const data = await res.json();

      if (data.success) {
        alert(data.message);
        loadSolicitudes();
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al procesar solicitud');
    } finally {
      setProcesando(null);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando solicitudes...</p>
        </div>
      </div>
    );
  }

  const pendientes = solicitudes.filter((s) => s.estado === 'PENDIENTE').length;
  const aprobadas = solicitudes.filter((s) => s.estado === 'APROBADO').length;
  const rechazadas = solicitudes.filter((s) => s.estado === 'RECHAZADO').length;

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <h1 className="text-3xl font-bold text-slate-900">Solicitudes de Perfil Destacado</h1>
        </div>
        <p className="text-slate-600">Revisar y aprobar solicitudes de perfiles destacados con sus comprobantes de pago</p>
      </div>

      {/* Estadísticas */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="bg-gradient-to-br from-amber-50 to-yellow-50 border-amber-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-amber-700">Pendientes</p>
                <p className="text-3xl font-bold text-amber-900 mt-1">{pendientes}</p>
              </div>
              <svg className="w-12 h-12 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-green-50 to-emerald-50 border-green-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-green-700">Aprobadas</p>
                <p className="text-3xl font-bold text-green-900 mt-1">{aprobadas}</p>
              </div>
              <svg className="w-12 h-12 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
        <Card className="bg-gradient-to-br from-red-50 to-rose-50 border-red-200">
          <div className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-red-700">Rechazadas</p>
                <p className="text-3xl font-bold text-red-900 mt-1">{rechazadas}</p>
              </div>
              <svg className="w-12 h-12 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white border border-slate-200">
        <div className="p-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
            <label className="font-medium text-slate-700 flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Filtrar por estado:
            </label>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="flex-1 sm:flex-initial px-4 py-2 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Todos</option>
              <option value="PENDIENTE">Pendientes</option>
              <option value="APROBADO">Aprobadas</option>
              <option value="RECHAZADO">Rechazadas</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Lista de solicitudes */}
      {solicitudes.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
          </svg>
          <p className="text-lg font-semibold text-slate-600">No hay solicitudes</p>
          <p className="text-sm text-slate-500 mt-2">
            {filtroEstado ? `No se encontraron solicitudes con estado: ${filtroEstado}` : 'Las solicitudes aparecerán aquí'}
          </p>
        </Card>
      ) : (
        <div className="space-y-6">
          {solicitudes.map((solicitud) => (
            <Card key={solicitud.id} className="bg-white border border-slate-200 overflow-hidden">
              <div className="p-6">
                <div className="grid grid-cols-1 lg:grid-cols-[2fr_1fr_1fr] gap-6">
                  {/* Información del fotógrafo */}
                  <div className="space-y-3">
                    <div>
                      <h3 className="font-bold text-xl text-slate-900">
                        {solicitud.fotografo.nombrePublico || solicitud.fotografo.usuario.nombreCompleto}
                      </h3>
                      <p className="text-sm text-slate-600 flex items-center gap-2 mt-1">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                        {solicitud.fotografo.usuario.email}
                      </p>
                      <p className="text-sm text-slate-500">ID: {solicitud.fotografo.id}</p>
                    </div>

                    <div className="pt-3 border-t border-slate-100 space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-slate-600">Solicitado:</span>
                        <span className="font-medium">{new Date(solicitud.createdAt).toLocaleDateString('es-BO', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="text-slate-600">Plan:</span>
                        <span className="font-bold text-blue-600">{solicitud.dias} días - {solicitud.precio} Bs</span>
                      </div>
                      {solicitud.referenciaPago && (
                        <div className="flex items-center gap-2 text-sm">
                          <svg className="w-4 h-4 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                          </svg>
                          <span className="text-slate-600">Referencia:</span>
                          <span className="font-medium">{solicitud.referenciaPago}</span>
                        </div>
                      )}
                    </div>

                    {solicitud.notasFotografo && (
                      <div className="pt-3 border-t border-slate-100">
                        <p className="text-sm font-medium text-slate-700 mb-1">Notas del fotógrafo:</p>
                        <p className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">{solicitud.notasFotografo}</p>
                      </div>
                    )}

                    <div className="pt-3 border-t border-slate-100">
                      <span
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold ${
                          solicitud.estado === 'PENDIENTE'
                            ? 'bg-amber-100 text-amber-800'
                            : solicitud.estado === 'APROBADO'
                            ? 'bg-green-100 text-green-800'
                            : 'bg-red-100 text-red-800'
                        }`}
                      >
                        {solicitud.estado === 'PENDIENTE' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : solicitud.estado === 'APROBADO' ? (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        ) : (
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" />
                          </svg>
                        )}
                        {solicitud.estado}
                      </span>
                    </div>
                  </div>

                  {/* Comprobante */}
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Comprobante de Pago</p>
                    <div 
                      className="relative h-64 rounded-xl overflow-hidden border-2 border-slate-200 cursor-pointer hover:border-blue-400 transition group bg-slate-100"
                      onClick={() => setSelectedImage(solicitud.urlComprobante)}
                    >
                      <Image
                        src={solicitud.urlComprobante}
                        alt="Comprobante"
                        fill
                        className="object-contain group-hover:scale-105 transition"
                        unoptimized
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition flex items-center justify-center">
                        <div className="bg-white/90 text-slate-700 px-4 py-2 rounded-lg opacity-0 group-hover:opacity-100 transition flex items-center gap-2">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                          Click para ampliar
                        </div>
                      </div>
                    </div>
                    <a
                      href={solicitud.urlComprobante}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block text-center text-sm text-blue-600 hover:underline"
                    >
                      Abrir en nueva pestaña
                    </a>
                  </div>

                  {/* Acciones */}
                  <div className="space-y-4">
                    {solicitud.estado === 'PENDIENTE' ? (
                      <>
                        <Button
                          onClick={() => handleRevisar(solicitud.id, 'APROBAR')}
                          disabled={procesando === solicitud.id}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Aprobar
                        </Button>
                        <Button
                          onClick={() => handleRevisar(solicitud.id, 'RECHAZAR')}
                          disabled={procesando === solicitud.id}
                          variant="danger"
                          className="w-full"
                        >
                          <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                          Rechazar
                        </Button>
                      </>
                    ) : (
                      <div className="text-center text-sm text-slate-600">
                        <p className="font-medium mb-2">Solicitud procesada</p>
                        <p className="text-xs">Esta solicitud ya fue {solicitud.estado.toLowerCase()}</p>
                      </div>
                    )}

                    {solicitud.notasAdmin && (
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <p className="text-sm font-semibold text-slate-700 mb-2">Notas del admin:</p>
                        <p className="text-sm text-slate-600">{solicitud.notasAdmin}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para ver imagen ampliada */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full h-[80vh]">
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
              <Image
                src={selectedImage}
                alt="Comprobante ampliado"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
