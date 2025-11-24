'use client';

import React, { useEffect, useState } from 'react';
import { Card, Button } from '@/frontend/components/ui';
import { useAuth } from '@/frontend/repositories';
import { IPerfilFotografo } from '@/frontend/interfaces';
import Image from 'next/image';

export default function AdminVerificacionesPage() {
  const { user, token } = useAuth();
  const [requests, setRequests] = useState<IPerfilFotografo[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedDocument, setSelectedDocument] = useState<string | null>(null);

  const fetchRequests = async () => {
    try {
      const res = await fetch('/api/admin/verifications', {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      if (data.success) {
        setRequests(data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (user?.rol === 'ADMIN') {
      fetchRequests();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, token]);

  const handleAction = async (id: number, action: 'approve' | 'reject') => {
    if (!confirm(`¿Estás seguro de ${action === 'approve' ? 'aprobar' : 'rechazar'} esta solicitud?`)) return;

    try {
      const res = await fetch(`/api/admin/verifications/${id}/${action}`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.ok) {
        fetchRequests();
      } else {
        alert('Error al procesar la solicitud');
      }
    } catch (error) {
      console.error(error);
    }
  };

  if (!user || user.rol !== 'ADMIN') {
    return <div className="p-8">Acceso restringido</div>;
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-slate-900">Solicitudes de Verificación</h1>
        </div>
        <p className="text-slate-600">Revisa y aprueba los documentos de identidad de los fotógrafos</p>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Cargando solicitudes...</p>
          </div>
        </div>
      ) : requests.length === 0 ? (
        <Card className="p-12 text-center border-2 border-dashed border-slate-200">
          <svg className="w-16 h-16 text-slate-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p className="text-lg font-semibold text-slate-600">No hay solicitudes pendientes</p>
          <p className="text-sm text-slate-500 mt-2">Las nuevas solicitudes de verificación aparecerán aquí</p>
        </Card>
      ) : (
        <div className="grid gap-6">
          {requests.map(req => (
            <Card key={req.id} className="bg-white border border-slate-200 overflow-hidden">
              <div className="grid md:grid-cols-[2fr_1fr] gap-6 p-6">
                {/* Información del fotógrafo */}
                <div className="space-y-4">
                  <div>
                    <h3 className="text-2xl font-bold text-slate-900">{req.nombrePublico}</h3>
                    <p className="text-slate-600 flex items-center gap-2 mt-1">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                      {req.usuario?.nombreCompleto}
                    </p>
                    <p className="text-slate-600 flex items-center gap-2">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                      {req.usuario?.email}
                    </p>
                  </div>

                  <div className="grid md:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Ubicación</p>
                      <p className="font-medium text-slate-900 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                        {req.ubicacion || 'No especificada'}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500 mb-1">Sitio Web</p>
                      <p className="font-medium text-slate-900">
                        {req.sitioWeb ? (
                          <a href={req.sitioWeb} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline flex items-center gap-2">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                            </svg>
                            Ver sitio
                          </a>
                        ) : 'No especificado'}
                      </p>
                    </div>
                  </div>

                  {req.biografia && (
                    <div className="pt-4 border-t border-slate-100">
                      <p className="text-sm text-slate-500 mb-2">Biografía</p>
                      <p className="text-slate-700 text-sm leading-relaxed">{req.biografia}</p>
                    </div>
                  )}
                </div>

                {/* Documento y acciones */}
                <div className="space-y-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-700 mb-3">Documento de Identidad</p>
                    {req.urlDocumentoIdentidad ? (
                      <div className="space-y-3">
                        <div 
                          className="relative h-64 rounded-xl overflow-hidden bg-slate-100 border-2 border-slate-200 cursor-pointer hover:border-blue-400 transition group"
                          onClick={() => setSelectedDocument(req.urlDocumentoIdentidad || null)}
                        >
                          <Image
                            src={req.urlDocumentoIdentidad}
                            alt="Documento de identidad"
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
                          href={req.urlDocumentoIdentidad}
                          target="_blank"
                          rel="noreferrer"
                          className="block text-center text-sm text-blue-600 hover:underline"
                        >
                          Abrir en nueva pestaña
                        </a>
                      </div>
                    ) : (
                      <div className="h-64 rounded-xl border-2 border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center text-slate-400">
                        <svg className="w-12 h-12 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="font-medium">Sin documento</p>
                        <p className="text-sm">No se subió documento</p>
                      </div>
                    )}
                  </div>

                  <div className="flex flex-col gap-3 pt-4">
                    <Button
                      variant="primary"
                      onClick={() => handleAction(req.id, 'approve')}
                      className="w-full"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Aprobar Verificación
                    </Button>
                    <Button
                      variant="danger"
                      onClick={() => handleAction(req.id, 'reject')}
                      className="w-full"
                    >
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                      Rechazar
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Modal para ver documento ampliado */}
      {selectedDocument && (
        <div 
          className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
          onClick={() => setSelectedDocument(null)}
        >
          <div className="relative max-w-4xl w-full h-[80vh]">
            <button
              onClick={() => setSelectedDocument(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 transition"
            >
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="relative w-full h-full bg-white rounded-xl overflow-hidden">
              <Image
                src={selectedDocument}
                alt="Documento ampliado"
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
