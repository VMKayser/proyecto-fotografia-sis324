'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Card, Button } from '@/components';
import Image from 'next/image';

interface ConfiguracionSistema {
  id: number;
  clave: string;
  valor: string;
  descripcion?: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function AdminConfiguracionPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [qrPagoUrl, setQrPagoUrl] = useState('');
  const [instruccionesPago, setInstruccionesPago] = useState('');
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.rol !== 'ADMIN') {
      router.push('/dashboard');
      return;
    }

    loadConfig();
  }, [user, router]);

  const loadConfig = async () => {
    try {
      const res = await fetch('/api/admin/config', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const data = await res.json();

      if (data.success && data.data) {
        const configs = data.data as ConfiguracionSistema[];
        const qrConfig = configs.find((c: ConfiguracionSistema) => c.clave === 'qr_pago_destacado');
        const instrConfig = configs.find((c: ConfiguracionSistema) => c.clave === 'instrucciones_pago_destacado');

        if (qrConfig) setQrPagoUrl(qrConfig.valor);
        if (instrConfig) setInstruccionesPago(instrConfig.valor);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: 'Error al cargar configuración' });
    } finally {
      setLoading(false);
    }
  };

  const handleQrFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setQrFile(event.target.files?.[0] || null);
  };

  const handleUploadQrImage = async () => {
    if (!qrFile) return;

    try {
      setUploadingQr(true);
      const formData = new FormData();
      formData.append('file', qrFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Error al subir el QR');
      }

      const data = await response.json();
      if (data?.url) {
        setQrPagoUrl(data.url);
        setMessage({ type: 'success', text: '✅ QR subido correctamente. Recuerda guardar los cambios.' });
      }
    } catch (error) {
      console.error('Error uploading QR:', error);
      setMessage({ type: 'error', text: '❌ Error al subir el QR' });
    } finally {
      setUploadingQr(false);
      setQrFile(null);
    }
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      setMessage(null);

      const res = await fetch('/api/admin/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          qr_pago_destacado: qrPagoUrl,
          instrucciones_pago_destacado: instruccionesPago,
        }),
      });

      const data = await res.json();

      if (data.success) {
        setMessage({ type: 'success', text: '✅ Configuración actualizada correctamente' });
        loadConfig();
      } else {
        setMessage({ type: 'error', text: `❌ ${data.error || 'Error al guardar'}` });
      }
    } catch (error) {
      console.error('Error:', error);
      setMessage({ type: 'error', text: '❌ Error al guardar configuración' });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Cargando configuración...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
        <div className="flex items-center gap-3 mb-2">
          <svg className="w-8 h-8 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <h1 className="text-3xl font-bold text-slate-900">Configuración del Sistema</h1>
        </div>
        <p className="text-slate-600">Configura el QR de pago para que los fotógrafos destaquen sus perfiles</p>
      </div>

      {message && (
        <div
          className={`p-4 rounded-xl border ${
            message.type === 'success'
              ? 'bg-green-50 text-green-800 border-green-200'
              : 'bg-red-50 text-red-800 border-red-200'
          }`}
        >
          {message.text}
        </div>
      )}

      <Card padding="lg" className="bg-white border border-slate-200">
        <div className="space-y-6">
          <div>
            <h2 className="text-xl font-bold text-slate-900 mb-2 flex items-center gap-2">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
              </svg>
              QR de Pago para Destacados
            </h2>
            <p className="text-sm text-slate-600">
              Este QR se mostrará a los fotógrafos cuando quieran destacar su perfil
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            {/* Vista previa del QR */}
            <div className="space-y-4">
              <label className="block text-sm font-semibold text-slate-700">Vista Previa</label>
              <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-slate-50 p-6">
                {qrPagoUrl ? (
                  <div className="relative h-80 rounded-xl overflow-hidden bg-white flex items-center justify-center">
                    <Image
                      src={qrPagoUrl}
                      alt="QR de pago"
                      fill
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                ) : (
                  <div className="h-80 flex flex-col items-center justify-center text-slate-400 gap-3">
                    <svg className="w-20 h-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                    </svg>
                    <p className="font-semibold text-lg">Aún no hay QR configurado</p>
                    <p className="text-sm text-center">Los fotógrafos verán aquí tu medio de pago</p>
                  </div>
                )}
              </div>
              {qrPagoUrl && (
                <div className="flex gap-3">
                  <Button
                    variant="outline"
                    onClick={() => setQrPagoUrl('')}
                    className="flex-1"
                  >
                    Eliminar QR
                  </Button>
                  <a
                    href={qrPagoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="flex-1 px-4 py-2 rounded-xl border text-sm border-slate-300 text-slate-600 hover:border-slate-400 text-center"
                  >
                    Abrir en nueva pestaña
                  </a>
                </div>
              )}
            </div>

            {/* Subir archivo */}
            <div className="space-y-6">
              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">Subir Nuevo QR</label>
                <div className="border-2 border-dashed border-blue-200 rounded-2xl p-6 bg-blue-50/30 hover:bg-blue-50/50 transition">
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleQrFileChange}
                    className="block w-full text-sm text-slate-600 file:mr-4 file:py-3 file:px-6 file:rounded-xl file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer cursor-pointer"
                  />
                  <p className="text-xs text-slate-500 mt-3">
                    Formatos admitidos: JPG, PNG o WebP (máx. 8MB)
                  </p>
                </div>
                {qrFile && (
                  <div className="bg-white border border-slate-200 rounded-xl p-4 flex flex-col gap-3">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-700">{qrFile.name}</p>
                        <p className="text-xs text-slate-500">
                          {(qrFile.size / 1024 / 1024).toFixed(2)} MB
                        </p>
                      </div>
                    </div>
                    <Button onClick={handleUploadQrImage} disabled={uploadingQr} className="w-full">
                      {uploadingQr ? 'Subiendo...' : 'Subir y Actualizar QR'}
                    </Button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <label className="block text-sm font-semibold text-slate-700">
                  Instrucciones de Pago
                </label>
                <textarea
                  value={instruccionesPago}
                  onChange={(e) => setInstruccionesPago(e.target.value)}
                  rows={8}
                  placeholder="Ejemplo: Transferir a Banco Unión, Cuenta Nº 123456789. Enviar comprobante con tu nombre completo y ID de perfil."
                  className="w-full rounded-xl border border-slate-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
                />
                <p className="text-xs text-slate-500">
                  Estas instrucciones se mostrarán a los fotógrafos cuando soliciten destacar su perfil
                </p>
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center pt-6 border-t border-slate-200">
            <Button
              variant="outline"
              onClick={loadConfig}
            >
              Descartar Cambios
            </Button>
            <Button
              onClick={handleSave}
              disabled={saving || (!qrPagoUrl && !instruccionesPago)}
              className="px-8"
            >
              {saving ? 'Guardando...' : 'Guardar Configuración'}
            </Button>
          </div>
        </div>
      </Card>

      <Card padding="lg" className="bg-gradient-to-r from-amber-50 to-orange-50 border-amber-200">
        <div className="flex items-start gap-4">
          <svg className="w-6 h-6 text-amber-600 flex-shrink-0 mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <h3 className="font-bold text-amber-900 mb-2">Información Importante</h3>
            <ul className="space-y-1 text-sm text-amber-800">
              <li>• El QR configurado se mostrará en la página de "Destacar Perfil" para todos los fotógrafos</li>
              <li>• Los fotógrafos deberán subir su comprobante de pago junto con la solicitud</li>
              <li>• Podrás revisar y aprobar/rechazar las solicitudes en "Solicitudes Destacados"</li>
              <li>• Los planes disponibles son: 7 días (Bs 100), 30 días (Bs 350), 90 días (Bs 900)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
}
