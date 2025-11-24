/**
 * 📊 Dashboard - Página Principal del Usuario
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Card, Button } from '@/components';
import Link from 'next/link';
import { EstadoComprobante, IPerfilFotografo, IPaquete, IReserva, IUsuario } from '@/frontend/interfaces';

type ReservationWithExtras = IReserva & {
  monto?: number;
  fecha?: string | Date;
  fotografo?: IUsuario;
};

export default function DashboardPage() {
  const { user, loading, token } = useAuth();
  const router = useRouter();
  const [reservations, setReservations] = useState<ReservationWithExtras[]>([]);
  const [profile, setProfile] = useState<IPerfilFotografo | null>(null);
  const [packages, setPackages] = useState<IPaquete[]>([]);
  const [dashboardMetrics, setDashboardMetrics] = useState<{
    verifiedPhotographers: number;
    eventsCovered: number;
    averageRating: number;
  } | null>(null);

  const [qrCodeUrl, setQrCodeUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  // Generar QR para fotógrafos
  useEffect(() => {
    if (user?.rol === 'FOTOGRAFO' && profile?.id) {
      const generateQR = async () => {
        try {
          const QRCode = (await import('qrcode')).default;
          const profileUrl = `${window.location.origin}/perfil/${profile.id}`;
          const url = await QRCode.toDataURL(profileUrl, {
            width: 200,
            margin: 2,
            color: {
              dark: '#0f172a',
              light: '#ffffff',
            },
          });
          setQrCodeUrl(url);
        } catch (err) {
          console.error('Error generando QR', err);
        }
      };
      generateQR();
    }
  }, [user, profile]);

  useEffect(() => {
    if (!user || !token) return;

    let cancelled = false;
    const controller = new AbortController();

    const loadDashboard = async () => {
      try {
        const headers = {
          Authorization: `Bearer ${token}`,
        };

        const reservationResponse = await fetch('/api/reservations', {
          headers,
          signal: controller.signal,
        });
        if (reservationResponse.ok) {
          const reservationPayload = await reservationResponse.json();
          const list = Array.isArray(reservationPayload.data)
            ? (reservationPayload.data as ReservationWithExtras[])
            : [];
          if (!cancelled) {
            setReservations(list);
          }
        } else if (!cancelled) {
          setReservations([]);
        }

        if (user.rol === 'FOTOGRAFO') {
          const profileResponse = await fetch('/api/profiles/me', {
            headers,
            signal: controller.signal,
          });
          if (profileResponse.ok) {
            const profilePayload = await profileResponse.json();
            const profileData = (profilePayload?.data ?? null) as IPerfilFotografo | null;
            if (!cancelled) {
              setProfile(profileData);
              setPackages((profileData?.paquetes ?? []) as IPaquete[]);
            }
          }
        }

        // Cargar métricas agregadas (opcional, público)
        try {
          const metricsRes = await fetch('/api/dashboard', { signal: controller.signal });
          if (metricsRes.ok) {
            const metricsPayload = await metricsRes.json();
            if (!cancelled && metricsPayload?.data) {
              setDashboardMetrics(metricsPayload.data);
            }
          }
        } catch (error) {
          if ((error as DOMException)?.name === 'AbortError') return;
          console.warn('No se pudieron cargar las métricas agregadas', error);
        }
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return;
        console.error('Error al cargar dashboard:', error);
        if (!cancelled) {
          setReservations([]);
          setPackages([]);
        }
      }
    };

    loadDashboard();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, [user, token]);

  const isPhotographer = user?.rol === 'FOTOGRAFO';

  const reservationStats = useMemo(() => {
    const total = reservations.length;
    const pendientes = reservations.filter((reserva) => reserva.estado === 'PENDIENTE').length;
    const confirmadas = reservations.filter((reserva) => reserva.estado === 'CONFIRMADA').length;
    const completadas = reservations.filter((reserva) => reserva.estado === 'COMPLETADA').length;
    const ingresos = reservations
      .filter((reserva) => reserva.estado === 'COMPLETADA')
      .reduce((sum, reserva) => sum + Number(reserva.precioFinal ?? reserva.monto ?? reserva.paquete?.precio ?? 0), 0);
    return { total, pendientes, confirmadas, completadas, ingresos };
  }, [reservations]);

  // const paymentStats = useMemo(() => {
  //   const base = {
  //     [EstadoComprobante.NO_ENVIADO]: 0,
  //     [EstadoComprobante.PENDIENTE]: 0,
  //     [EstadoComprobante.APROBADO]: 0,
  //     [EstadoComprobante.RECHAZADO]: 0,
  //   } as Record<EstadoComprobante, number>;

  //   reservations.forEach((reserva) => {
  //     const estado = reserva.comprobanteEstado ?? EstadoComprobante.NO_ENVIADO;
  //     base[estado] += 1;
  //   });

  //   return {
  //     enviados: reservations.length - base[EstadoComprobante.NO_ENVIADO],
  //     pendientes: base[EstadoComprobante.PENDIENTE],
  //     aprobados: base[EstadoComprobante.APROBADO],
  //     rechazados: base[EstadoComprobante.RECHAZADO],
  //   };
  // }, [reservations]);

  const pendingProofs = useMemo(
    () =>
      reservations
        .filter((reserva) => reserva.comprobanteEstado === EstadoComprobante.PENDIENTE)
        .slice(0, 3),
    [reservations]
  );

  const averageRating = profile?.calificacionPromedio
    ? Number(profile.calificacionPromedio).toFixed(1)
    : 'N/A';
  const totalReviews = profile?.totalResenas ?? 0;

  const formatReservationDate = (reserva: ReservationWithExtras) => {
    const rawDate = reserva.fechaEvento ?? reserva.fecha ?? reserva.creadoEn;
    if (!rawDate) return 'Fecha por confirmar';
    return new Date(rawDate).toLocaleDateString('es-BO', { day: 'numeric', month: 'short' });
  };

  const snapshotCards = isPhotographer
    ? [
      {
        title: 'Reservas activas',
        value: reservationStats.total,
        icon: '📅',
        tone: 'text-blue-600',
        trend: `${reservationStats.pendientes} pendientes · ${reservationStats.confirmadas} confirmadas`,
      },
      {
        title: 'Ingresos estimados',
        value: `${reservationStats.ingresos} Bs`,
        icon: '�',
        tone: 'text-emerald-600',
        trend: 'Total acumulado',
      },
      {
        title: 'Paquetes activos',
        value: packages.length,
        icon: '📦',
        tone: 'text-purple-600',
        trend: 'Servicios publicados',
      },
      {
        title: 'Calificación',
        value: averageRating,
        icon: '⭐',
        tone: 'text-amber-500',
        trend: `${totalReviews} reseñas recibidas`,
      },
    ]
    : [
      {
        title: 'Mis Eventos',
        value: reservationStats.total,
        icon: '🎉',
        tone: 'text-blue-600',
        trend: `${reservationStats.confirmadas} confirmados`,
      },
      {
        title: 'Pendientes',
        value: reservationStats.pendientes,
        icon: '⏳',
        tone: 'text-amber-600',
        trend: 'Solicitudes en espera',
      },
      {
        title: 'Reseñas dadas',
        value: reservations.filter(r => r.resena).length,
        icon: '✍️',
        tone: 'text-purple-600',
        trend: 'Opiniones compartidas',
      },
    ];

  const quickActions = isPhotographer
    ? [
      { href: '/perfil-fotografo', title: 'Optimizar perfil', description: 'Actualiza portada y biografía', icon: '✨' },
      { href: '/mis-paquetes', title: 'Gestionar paquetes', description: 'Configura precios y coberturas', icon: '📦' },
      { href: '/mis-reservas', title: 'Solicitudes nuevas', description: 'Confirma o reprograma reservas', icon: '📥' },
      { href: '/dashboard/calendario', title: 'Mi Calendario', description: 'Gestiona tu disponibilidad', icon: '📅' },
    ]
    : [
      { href: '/fotografos', title: 'Explorar portfolios', description: 'Filtra por estilo y ciudad', icon: '🔍' },
      { href: '/mis-reservas', title: 'Mis eventos', description: 'Gestiona pagos y entregas', icon: '📅' },
      { href: '/perfil', title: 'Actualizar perfil', description: 'Preferencias y datos de contacto', icon: '⚙️' },
    ];

  const timeline = useMemo(() => {
    const upcoming = reservations
      .filter((reserva) => ['PENDIENTE', 'CONFIRMADA'].includes(reserva.estado))
      .sort((a, b) => {
        const aDate = new Date(a.fechaEvento ?? a.fecha ?? 0).getTime();
        const bDate = new Date(b.fechaEvento ?? b.fecha ?? 0).getTime();
        return aDate - bDate;
      })
      .slice(0, 4)
      .map((reserva) => ({
        title: reserva.paquete?.nombre || reserva.paquete?.titulo || 'Sesión reservada',
        detail: `${formatReservationDate(reserva)} • ${reserva.ubicacionEvento || reserva.paquete?.descripcion || 'Ubicación por definir'}`,
        status: reserva.estado,
      }));

    return upcoming.length
      ? upcoming
      : [
        { title: 'Planifica tu siguiente sesión', detail: 'Actualiza tu calendario para recibir más solicitudes', status: 'Tip' },
      ];
  }, [reservations]);

  const notifications = useMemo(() => {
    const derived = reservations
      .filter((reserva) => reserva.estado === 'PENDIENTE' || reserva.estado === 'CONFIRMADA')
      .slice(0, 3)
      .map((reserva) => ({
        title: reserva.estado === 'PENDIENTE' ? 'Nueva solicitud' : 'Reserva confirmada',
        message: `${isPhotographer
            ? reserva.cliente?.nombreCompleto || 'Cliente'
            : reserva.fotografo?.nombreCompleto || 'Fotógrafo'
          } · ${formatReservationDate(reserva)}`,
        time: reserva.estado,
      }));

    if (derived.length) {
      return derived;
    }

    return [
      { title: 'Activa tus recordatorios', message: 'Configura alertas para responder en menos de 2 horas.', time: 'Sugerencia' },
    ];
  }, [reservations, isPhotographer]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="bg-slate-50 min-h-screen py-10 pb-24">
      <div className="container mx-auto px-4 space-y-8">
        <section className="bg-white rounded-3xl p-8 shadow-sm border border-slate-100 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm text-slate-500">Bienvenido de vuelta</p>
            <h1 className="text-3xl font-semibold text-slate-900">
              {user.nombreCompleto}
            </h1>
            <p className="text-slate-500 mt-2 max-w-2xl">
              {isPhotographer
                ? 'Administra tus solicitudes, mantén tu portafolio actualizado y responde a los clientes en minutos.'
                : 'Revisa tus solicitudes, confirma entregas y haz seguimiento del estado de tus reservas.'}
            </p>
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full border text-sm font-medium text-slate-600">
              {isPhotographer ? '📸 Fotógrafo' : '👤 Cliente'}
              <span className="text-slate-400">•</span>
              Última sesión actualizada hace 2 días
            </div>
          </div>
          <div className="space-y-3 w-full md:w-auto">
            {user.rol === 'ADMIN' && (
              <Link href="/admin">
                <Button variant="primary" className="w-full md:w-auto bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600">
                  🔑 Panel de Administrador
                </Button>
              </Link>
            )}
            <Link href={isPhotographer ? '/perfil-fotografo' : '/perfil'}>
              <Button variant="primary" className="w-full md:w-auto">
                {isPhotographer ? 'Actualizar perfil público' : 'Completar preferencias'}
              </Button>
            </Link>
            <Link href={isPhotographer ? '/mis-reservas' : '/fotografos'}>
              <Button variant="outline" className="w-full md:w-auto">
                {isPhotographer ? 'Ver reservas' : 'Buscar fotógrafos'}
              </Button>
            </Link>
          </div>
        </section>

        {isPhotographer && dashboardMetrics && (
          <div className="grid md:grid-cols-3 gap-6">
            <Card padding="lg" className="bg-white">
              <p className="text-sm text-blue-600 font-semibold">Tu impacto</p>
              <h3 className="text-2xl font-semibold text-slate-900 mt-2">Visibilidad en la plataforma</h3>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{dashboardMetrics.verifiedPhotographers}</div>
                  <div className="text-xs text-slate-500">Colegas verificados</div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-slate-900">{dashboardMetrics.eventsCovered}</div>
                  <div className="text-xs text-slate-500">Eventos totales</div>
                </div>
              </div>
            </Card>

            {qrCodeUrl && (
              <Card padding="lg" className="bg-white md:col-span-2 flex flex-row items-center gap-6">
                <div className="hidden sm:block p-2 bg-white border rounded-xl shadow-sm">
                  <Image
                    src={qrCodeUrl}
                    alt="Tu QR de perfil"
                    width={128}
                    height={128}
                    className="object-contain"
                    unoptimized
                  />
                </div>
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Promociona tu trabajo</p>
                  <h3 className="text-xl font-semibold text-slate-900 mt-1">Comparte tu perfil profesional</h3>
                  <p className="text-sm text-slate-500 mt-2 mb-3">
                    Usa este código QR en tus redes sociales o tarjetas para que los clientes reserven directamente contigo.
                  </p>
                  <div className="flex gap-3">
                    <a
                      href={qrCodeUrl}
                      download={`qr-perfil-${user.nombreCompleto?.replace(/\s+/g, '-') || 'fotografo'}.png`}
                      className="text-sm font-medium text-blue-600 hover:underline"
                    >
                      Descargar QR
                    </a>
                    <Link href={`/perfil/${profile?.id}`} className="text-sm font-medium text-slate-600 hover:underline">
                      Ver mi perfil público
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {!isPhotographer && (
          <section className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-3xl p-8 text-white shadow-lg">
            <div className="flex flex-col md:flex-row items-center justify-between gap-6">
              <div>
                <h2 className="text-2xl font-bold">¿Buscas capturar un momento especial?</h2>
                <p className="text-blue-100 mt-2 max-w-xl">
                  Explora nuestro catálogo de fotógrafos verificados y encuentra el estilo perfecto para tu próximo evento.
                </p>
              </div>
              <Link href="/fotografos">
                <Button variant="secondary" className="bg-white text-blue-600 hover:bg-blue-50 whitespace-nowrap">
                  Explorar fotógrafos
                </Button>
              </Link>
            </div>
          </section>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {snapshotCards.map((card) => (
            <Card key={card.title} padding="lg" className="bg-white">
              <div className="flex items-center justify-between">
                <span className="text-4xl">{card.icon}</span>
                <span className={`text-3xl font-semibold ${card.tone}`}>{card.value}</span>
              </div>
              <p className="text-slate-900 font-semibold mt-4">{card.title}</p>
              <p className="text-xs text-slate-500 mt-1">{card.trend}</p>
            </Card>
          ))}
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Acciones prioritarias</p>
                  <h2 className="text-2xl font-semibold text-slate-900">Tu flujo de trabajo</h2>
                </div>
                <Button variant="outline">Ver calendario</Button>
              </div>
              <div className="grid md:grid-cols-3 gap-4">
                {quickActions.map((action) => (
                  <Link href={action.href} key={action.title}>
                    <Card hover className="h-full">
                      <div className="p-4 space-y-2">
                        <div className="text-3xl">{action.icon}</div>
                        <p className="font-semibold text-slate-900">{action.title}</p>
                        <p className="text-sm text-slate-500">{action.description}</p>
                      </div>
                    </Card>
                  </Link>
                ))}
              </div>
            </Card>

            <Card padding="lg">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-blue-600 font-semibold">Agenda de la semana</p>
                  <h2 className="text-xl font-semibold text-slate-900">Próximas entregas y sesiones</h2>
                </div>
                <Button variant="outline">Sincronizar calendario</Button>
              </div>
              <div className="space-y-4">
                {timeline.map((event) => (
                  <div key={event.title} className="flex items-start gap-4">
                    <div className="w-2 h-2 mt-2 rounded-full bg-blue-500"></div>
                    <div>
                      <p className="font-semibold text-slate-900">{event.title}</p>
                      <p className="text-sm text-slate-500">{event.detail}</p>
                      <span className="text-xs inline-flex px-2 py-1 rounded-full bg-blue-50 text-blue-600 mt-2">
                        {event.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>

          <div className="flex flex-col gap-6">
            <Card padding="lg" className="relative">
              <p className="text-sm text-blue-600 font-semibold">Notificaciones</p>
              <h2 className="text-xl font-semibold text-slate-900 mt-1">Últimos movimientos</h2>
              <div className="mt-6 space-y-4">
                {notifications.map((notif) => (
                  <div key={notif.title} className="border border-slate-100 rounded-2xl p-4">
                    <p className="font-semibold text-slate-900">{notif.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{notif.message}</p>
                    <p className="text-xs text-slate-400 mt-2">{notif.time}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card padding="lg" className="relative">
              <p className="text-sm text-blue-600 font-semibold">Pagos manuales</p>
              <h2 className="text-xl font-semibold text-slate-900 mt-1">
                {isPhotographer ? 'Comprobantes por revisar' : 'Estado de mis comprobantes'}
              </h2>
              <div className="mt-6 space-y-4">
                {pendingProofs.length ? (
                  pendingProofs.map((reserva) => (
                    <div key={reserva.id} className="border border-slate-100 rounded-2xl p-4">
                      <p className="font-semibold text-slate-900">
                        {isPhotographer
                          ? reserva.cliente?.nombreCompleto || 'Cliente'
                          : reserva.fotografo?.nombreCompleto || 'Fotógrafo'}
                      </p>
                      <p className="text-sm text-slate-500">
                        {formatReservationDate(reserva)} · {reserva.paquete?.titulo || reserva.paquete?.nombre || 'Sesión'}
                      </p>
                      <div className="flex items-center gap-2 mt-3">
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-600">
                          En revisión
                        </span>
                        <Link
                          href="/mis-reservas"
                          className="text-xs font-medium text-blue-600 hover:underline"
                        >
                          Ver detalles
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-slate-500">
                    {isPhotographer
                      ? 'No tienes comprobantes pendientes. Mantén tu QR actualizado desde Perfil.'
                      : 'Todos tus comprobantes fueron revisados. Si necesitas actualizar alguno, visita Mis Reservas.'}
                  </p>
                )}
              </div>
            </Card>

            <Card padding="lg" className="relative bg-gradient-to-br from-slate-900 to-slate-800 text-white">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Tips de conversión</p>
              <h3 className="text-xl font-semibold mt-3">Mantente en el top del marketplace</h3>
              <ul className="mt-4 space-y-2 text-sm text-white/80">
                <li>• Responde solicitudes antes de 2 horas</li>
                <li>• Actualiza tu portafolio cada semana</li>
                <li>• Activa paquetes con precios claros</li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}
