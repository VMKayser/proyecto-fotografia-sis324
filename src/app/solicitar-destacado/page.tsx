'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/frontend/repositories/AuthContext';
import { useRouter } from 'next/navigation';
import Image from 'next/image';

interface PrecioOpcion {
  dias: number;
  precio: number;
  ahorro: number;
  precioOriginal: number;
}

export default function SolicitarDestacadoPage() {
  const { user, token } = useAuth();
  const router = useRouter();

  const [precios, setPrecios] = useState<PrecioOpcion[]>([]);
  const [beneficios, setBeneficios] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    dias: 7,
    urlComprobante: '',
    referenciaPago: '',
    notasFotografo: '',
  });

  const [uploadingImage, setUploadingImage] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);


  // Verificar que sea fotógrafo
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.rol !== 'FOTOGRAFO') {
      router.push('/dashboard');
      return;
    }

    loadPrecios();
  }, [user, router]);

  const loadPrecios = async () => {
    try {
      const res = await fetch('/api/destacado/precios');
      const data = await res.json();

      if (data.success) {
        setPrecios(data.data.opciones);
        setBeneficios(data.data.beneficios);
      }
    } catch (error) {
      console.error('Error al cargar precios:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) {
      setPreviewUrl(null);
      setFormData((prev) => ({ ...prev, urlComprobante: '' }));
      return;
    }

    // Validar tipo de archivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor selecciona una imagen válida');
      setPreviewUrl(null);
      setFormData((prev) => ({ ...prev, urlComprobante: '' }));
      return;
    }

    // Validar tamaño (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      alert('La imagen no debe superar 5MB');
      setPreviewUrl(null);
      setFormData((prev) => ({ ...prev, urlComprobante: '' }));
      return;
    }

    setPreviewUrl(URL.createObjectURL(file));
    setUploadingImage(true);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await res.json();

      if (data.success) {
        setFormData((prev) => ({ ...prev, urlComprobante: data.url }));
      } else {
        alert('Error al subir imagen: ' + data.error);
        setPreviewUrl(null); // Clear preview on upload error
        setFormData((prev) => ({ ...prev, urlComprobante: '' }));
      }
    } catch (error) {
      console.error('Error uploading:', error);
      alert('Error al subir la imagen');
      setPreviewUrl(null); // Clear preview on upload error
      setFormData((prev) => ({ ...prev, urlComprobante: '' }));
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.urlComprobante) {
      alert('Debes subir el comprobante de pago');
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch('/api/destacado/solicitar', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (data.success) {
        alert('✅ Solicitud enviada correctamente. Será revisada por un administrador.');
        router.push('/perfil-fotografo');
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Error al enviar solicitud');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  const selectedPrecio = precios.find((p) => p.dias === formData.dias);

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg p-8 text-white mb-8">
          <h1 className="text-3xl font-bold mb-2">⭐ Destaca tu Perfil</h1>
          <p className="text-lg opacity-90">
            Aumenta tu visibilidad y recibe más clientes
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8">
          {/* Formulario */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold mb-6">Solicitar Destacado</h2>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Selección de duración */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Duración
                </label>
                <div className="space-y-3">
                  {precios.map((opcion) => (
                    <label
                      key={opcion.dias}
                      className={`flex items-center justify-between p-4 border-2 rounded-lg cursor-pointer transition ${formData.dias === opcion.dias
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="radio"
                          name="dias"
                          value={opcion.dias}
                          checked={formData.dias === opcion.dias}
                          onChange={(e) =>
                            setFormData({ ...formData, dias: parseInt(e.target.value) })
                          }
                          className="mr-3"
                        />
                        <div>
                          <div className="font-semibold">{opcion.dias} días</div>
                          {opcion.ahorro > 0 && (
                            <div className="text-sm text-green-600">
                              ¡Ahorra {Math.round(opcion.ahorro * 100)}%!
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-blue-600">
                          {opcion.precio} BOB
                        </div>
                        {opcion.ahorro > 0 && (
                          <div className="text-sm text-gray-400 line-through">
                            {Math.round(opcion.precioOriginal)} BOB
                          </div>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Comprobante de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Comprobante de Pago *
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  disabled={uploadingImage}
                  className="w-full px-3 py-2 border rounded-lg"
                />
                {uploadingImage && (
                  <p className="text-sm text-blue-600 mt-2">Subiendo imagen...</p>
                )}
                {previewUrl && (
                  <div className="mt-4 p-4 bg-slate-50 rounded-xl relative h-64">
                    <Image
                      src={previewUrl}
                      alt="Vista previa del comprobante"
                      fill
                      className="object-contain"
                    />
                  </div>
                )}
              </div>

              {/* Referencia de pago */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Referencia de Pago (opcional)
                </label>
                <input
                  type="text"
                  value={formData.referenciaPago}
                  onChange={(e) =>
                    setFormData({ ...formData, referenciaPago: e.target.value })
                  }
                  placeholder="Ej: TRX-123456"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>

              {/* Notas */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notas adicionales (opcional)
                </label>
                <textarea
                  value={formData.notasFotografo}
                  onChange={(e) =>
                    setFormData({ ...formData, notasFotografo: e.target.value })
                  }
                  rows={3}
                  className="w-full px-3 py-2 border rounded-lg"
                  placeholder="Información adicional que quieras compartir..."
                />
              </div>

              {/* Total */}
              {selectedPrecio && (
                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center text-lg font-bold">
                    <span>Total a pagar:</span>
                    <span className="text-blue-600 text-2xl">
                      {selectedPrecio.precio} BOB
                    </span>
                  </div>
                </div>
              )}

              {/* Botón submit */}
              <button
                type="submit"
                disabled={submitting || uploadingImage || !formData.urlComprobante}
                className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
              >
                {submitting ? 'Enviando...' : 'Enviar Solicitud'}
              </button>
            </form>
          </div>

          {/* Beneficios */}
          <div>
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <h3 className="text-xl font-bold mb-4">✨ Beneficios de Destacar</h3>
              <ul className="space-y-3">
                {beneficios.map((beneficio, index) => (
                  <li key={index} className="flex items-start">
                    <span className="text-green-500 mr-2">✓</span>
                    <span className="text-gray-700">{beneficio}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-blue-50 rounded-lg p-6">
              <h3 className="text-lg font-bold mb-3">💡 Instrucciones de Pago</h3>
              <div className="space-y-2 text-sm text-gray-700">
                <p>1. Realiza el pago por transferencia bancaria</p>
                <p>2. Toma una captura del comprobante</p>
                <p>3. Súbelo en el formulario</p>
                <p>4. Espera la aprobación (máx. 24h)</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
