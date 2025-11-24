/**
 * 🌟 Página de Destacar Perfil - Para Fotógrafos
 * Permite a los fotógrafos pagar para destacar su perfil por 7, 30 o 90 días
 */

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Card, Input } from '@/frontend/components/ui';
import { useAuth } from '@/frontend/repositories';

interface PhotographerProfile {
  id: number;
  nombrePublico: string;
  destacadoHasta: string | null;
}

interface PlanOption {
  days: number;
  price: number;
  label: string;
  popular?: boolean;
}

const PLAN_OPTIONS: PlanOption[] = [
  { days: 7, price: 100, label: '1 Semana' },
  { days: 30, price: 350, label: '1 Mes', popular: true },
  { days: 90, price: 1000, label: '3 Meses' }
];

export default function DestacarPerfilPage() {
  const router = useRouter();
  const { user, loading: authLoading, token } = useAuth();

  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [selectedPlan, setSelectedPlan] = useState<PlanOption | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  // Estado del formulario de pago
  const [paymentProof, setPaymentProof] = useState<File | null>(null);
  const [paymentReference, setPaymentReference] = useState('');
  const [paymentNotes, setPaymentNotes] = useState('');

  // Configuración de pago del admin
  const [qrPagoUrl, setQrPagoUrl] = useState('');
  const [instruccionesPago, setInstruccionesPago] = useState('');

  useEffect(() => {
    if (!authLoading && (!user || user.rol !== 'FOTOGRAFO')) {
      router.push('/login');
      return;
    }

    if (user && token) {
      loadPhotographerProfile();
      loadPaymentConfig();
    }
  }, [user, authLoading, token]);

  const loadPaymentConfig = async () => {
    try {
      const response = await fetch('/api/admin/config');

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const configs = result.data;
          const qrConfig = configs.find((c: any) => c.clave === 'qr_pago_destacado');
          const instrConfig = configs.find((c: any) => c.clave === 'instrucciones_pago_destacado');
          
          setQrPagoUrl(qrConfig?.valor || '');
          setInstruccionesPago(instrConfig?.valor || 'Realiza la transferencia y sube tu comprobante');
        }
      }
    } catch (error) {
      console.error('Error cargando configuración de pago:', error);
    }
  };

  const loadPhotographerProfile = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/profiles?usuarioId=${user?.id}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const profiles = await response.json();
        if (profiles.length > 0) {
          setProfile(profiles[0]);
        }
      }
    } catch (error) {
      console.error('Error cargando perfil:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectPlan = (plan: PlanOption) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handlePaymentProofUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setPaymentProof(e.target.files[0]);
    }
  };

  const handleSubmitPayment = async () => {
    if (!selectedPlan || !profile || !paymentProof) {
      alert('Por favor completa todos los campos requeridos');
      return;
    }

    try {
      setSubmitting(true);

      // Subir comprobante de pago
      const formData = new FormData();
      formData.append('file', paymentProof);

      const uploadResponse = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!uploadResponse.ok) {
        throw new Error('Error subiendo comprobante');
      }

      const uploadData = await uploadResponse.json();

      // Crear solicitud de destacado
      const requestData = {
        fotografoId: profile.id,
        dias: selectedPlan.days,
        precio: selectedPlan.price,
        urlComprobante: uploadData.url,
        referenciaPago: paymentReference,
        notasFotografo: paymentNotes,
      };

      const response = await fetch('/api/solicitudes-destacado', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(requestData),
      });

      const result = await response.json();

      if (result.success) {
        alert(`¡Solicitud enviada! Tu perfil será destacado por ${selectedPlan.days} días una vez que el pago sea verificado.`);
        setShowPaymentModal(false);
        router.push('/perfil-fotografo');
      } else {
        alert(result.error || 'Error enviando solicitud');
      }
    } catch (error) {
      console.error('Error:', error);
      alert('Hubo un error procesando tu solicitud. Por favor intenta nuevamente.');
    } finally {
      setSubmitting(false);
    }
  };

  const calculateEndDate = (days: number) => {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return date.toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const isCurrentlyFeatured = () => {
    if (!profile?.destacadoHasta) return false;
    return new Date(profile.destacadoHasta) > new Date();
  };

  const getRemainingDays = () => {
    if (!profile?.destacadoHasta) return 0;
    const remaining = Math.ceil(
      (new Date(profile.destacadoHasta).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );
    return remaining > 0 ? remaining : 0;
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-white to-blue-50 p-4">
        <Card className="p-8 text-center max-w-md w-full">
          <div className="text-6xl mb-4">📸</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Perfil no encontrado</h2>
          <p className="text-gray-600 mb-6">
            Necesitas tener un perfil de fotógrafo para acceder a esta función.
          </p>
          <Button onClick={() => router.push('/perfil-fotografo')}>
            Crear Perfil
          </Button>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-blue-50 py-8 px-4 sm:py-12 sm:px-6 lg:px-8">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full mb-4 sm:mb-6">
            <span className="text-4xl sm:text-5xl">⭐</span>
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">
            Destaca tu Perfil
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-gray-600 max-w-2xl mx-auto px-4">
            Aumenta tu visibilidad y recibe más reservas apareciendo en los primeros resultados
          </p>
        </div>

        {/* Estado actual */}
        {isCurrentlyFeatured() && (
          <Card className="p-4 sm:p-6 mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
              <div className="flex-shrink-0">
                <span className="text-5xl sm:text-6xl">✅</span>
              </div>
              <div className="flex-1">
                <h3 className="text-lg sm:text-xl font-bold text-green-900 mb-1">
                  ¡Tu perfil está destacado!
                </h3>
                <p className="text-sm sm:text-base text-green-700">
                  Te quedan <strong>{getRemainingDays()} días</strong> de destacado hasta el{' '}
                  <strong>{new Date(profile.destacadoHasta!).toLocaleDateString('es-ES')}</strong>
                </p>
              </div>
            </div>
          </Card>
        )}

        {/* Beneficios */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6 mb-8 sm:mb-12">
          <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-purple-100 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">⭐</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              Posición Destacada
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Aparece en los primeros resultados de búsqueda
            </p>
          </Card>

          <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-blue-100 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">✅</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              Mayor Visibilidad
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Badge especial de &quot;Fotógrafo Destacado&quot;
            </p>
          </Card>

          <Card className="p-4 sm:p-6 text-center hover:shadow-lg transition-shadow">
            <div className="inline-flex items-center justify-center w-12 h-12 sm:w-16 sm:h-16 bg-green-100 rounded-full mb-3 sm:mb-4">
              <span className="text-3xl sm:text-4xl">📸</span>
            </div>
            <h3 className="text-base sm:text-lg font-bold text-gray-900 mb-2">
              Más Reservas
            </h3>
            <p className="text-sm sm:text-base text-gray-600">
              Aumenta tus oportunidades de trabajo
            </p>
          </Card>
        </div>

        {/* Planes de destacado */}
        <div className="mb-8 sm:mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 text-center mb-6 sm:mb-8">
            Elige tu Plan
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {PLAN_OPTIONS.map((plan) => (
              <Card
                key={plan.days}
                className={`p-6 sm:p-8 relative hover:shadow-xl transition-all ${plan.popular ? 'border-2 border-purple-500 transform scale-105' : ''
                  }`}
              >
                {plan.popular && (
                  <div className="absolute -top-3 sm:-top-4 left-1/2 transform -translate-x-1/2">
                    <span className="bg-gradient-to-r from-purple-600 to-blue-600 text-white px-3 sm:px-4 py-1 rounded-full text-xs sm:text-sm font-bold shadow-lg">
                      MÁS POPULAR
                    </span>
                  </div>
                )}

                <div className="text-center">
                  <div className="inline-flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-purple-100 to-blue-100 rounded-full mb-4 sm:mb-6">
                    <span className="text-4xl sm:text-5xl">📅</span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
                    {plan.label}
                  </h3>
                  <div className="mb-4 sm:mb-6">
                    <span className="text-3xl sm:text-4xl font-bold text-purple-600">
                      Bs {plan.price}
                    </span>
                    <p className="text-sm sm:text-base text-gray-600 mt-1">
                      {plan.days} días destacado
                    </p>
                  </div>

                  <div className="space-y-3 mb-6 text-left">
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0 text-lg">✓</span>
                      <span className="text-sm sm:text-base text-gray-700">
                        Posición prioritaria en búsquedas
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0 text-lg">✓</span>
                      <span className="text-sm sm:text-base text-gray-700">
                        Badge de &quot;Destacado&quot;
                      </span>
                    </div>
                    <div className="flex items-start gap-2">
                      <span className="text-green-600 flex-shrink-0 text-lg">✓</span>
                      <span className="text-sm sm:text-base text-gray-700">
                        Mayor visibilidad en la página principal
                      </span>
                    </div>
                  </div>

                  <Button
                    onClick={() => handleSelectPlan(plan)}
                    className={`w-full ${plan.popular
                        ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700'
                        : ''
                      }`}
                    disabled={submitting}
                  >
                    Seleccionar Plan
                  </Button>

                  <p className="text-xs text-gray-500 mt-3">
                    Válido hasta el {calculateEndDate(plan.days)}
                  </p>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Información adicional */}
        <Card className="p-4 sm:p-6 bg-blue-50 border-blue-200">
          <div className="flex items-start gap-3 sm:gap-4">
            <span className="text-2xl sm:text-3xl flex-shrink-0">ℹ️</span>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-blue-900 mb-2">
                ¿Cómo funciona el proceso?
              </h3>
              <ol className="list-decimal list-inside space-y-2 text-sm sm:text-base text-blue-800">
                <li>Selecciona el plan que mejor se adapte a tus necesidades</li>
                <li>Realiza el pago mediante transferencia o QR</li>
                <li>Sube el comprobante de pago</li>
                <li>Nuestro equipo verificará tu pago (generalmente en menos de 24 horas)</li>
                <li>¡Tu perfil será destacado automáticamente!</li>
              </ol>
            </div>
          </div>
        </Card>
      </div>

      {/* Modal de Pago */}
      {showPaymentModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <Card className="max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 sm:p-8">
              <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4 sm:mb-6">
                Pago del Plan: {selectedPlan.label}
              </h2>

              <div className="bg-gradient-to-r from-purple-50 to-blue-50 p-4 sm:p-6 rounded-lg mb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 sm:gap-0">
                  <div>
                    <p className="text-sm text-gray-600">Total a pagar:</p>
                    <p className="text-3xl sm:text-4xl font-bold text-purple-600">
                      Bs {selectedPlan.price}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm text-gray-600">Duración:</p>
                    <p className="text-xl sm:text-2xl font-bold text-gray-900">
                      {selectedPlan.days} días
                    </p>
                  </div>
                </div>
              </div>

              {/* Instrucciones de pago */}
              <div className="mb-6">
                <h3 className="text-lg font-bold text-gray-900 mb-3">
                  Instrucciones de Pago
                </h3>

                {qrPagoUrl && (
                  <div className="mb-4 flex justify-center relative w-48 h-48 mx-auto">
                    <Image
                      src={qrPagoUrl}
                      alt="QR de pago"
                      fill
                      className="object-contain border border-gray-300 rounded-lg"
                      unoptimized
                    />
                  </div>
                )}

                <div className="bg-gray-50 p-4 rounded-lg space-y-2 text-sm sm:text-base whitespace-pre-wrap">
                  <p className="text-gray-700">
                    {instruccionesPago || 'Realiza la transferencia y sube tu comprobante'}
                  </p>
                  <p className="text-gray-700 mt-4">
                    <strong>Concepto:</strong> Destacado {selectedPlan.days} días - {profile.nombrePublico}
                  </p>
                </div>
              </div>

              {/* Formulario */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Comprobante de Pago *
                  </label>
                  <input
                    type="file"
                    accept="image/*,application/pdf"
                    onChange={handlePaymentProofUpload}
                    className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Formatos aceptados: JPG, PNG, PDF (máx. 5MB)
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Referencia (opcional)
                  </label>
                  <Input
                    type="text"
                    value={paymentReference}
                    onChange={setPaymentReference}
                    placeholder="Ej: 123456789"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notas adicionales (opcional)
                  </label>
                  <textarea
                    value={paymentNotes}
                    onChange={(e) => setPaymentNotes(e.target.value)}
                    placeholder="Alguna información adicional sobre tu pago..."
                    className="w-full border border-gray-300 rounded-lg p-3 text-sm min-h-[80px]"
                  />
                </div>
              </div>

              {/* Botones */}
              <div className="flex flex-col sm:flex-row gap-3 mt-6 sm:mt-8">
                <Button
                  onClick={() => {
                    setShowPaymentModal(false);
                    setSelectedPlan(null);
                    setPaymentProof(null);
                    setPaymentReference('');
                    setPaymentNotes('');
                  }}
                  variant="outline"
                  className="flex-1 order-2 sm:order-1"
                  disabled={submitting}
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSubmitPayment}
                  disabled={!paymentProof || submitting}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 order-1 sm:order-2"
                >
                  {submitting ? 'Enviando...' : 'Enviar Solicitud'}
                </Button>
              </div>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}
