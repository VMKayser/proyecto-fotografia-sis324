'use client';

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button, Card } from '@/components';
import { ReviewList } from '@/frontend/components/reviews';
import { IPerfilFotografo, IUsuario } from '@/frontend/interfaces';
import { useAuth } from '@/hooks';
import { AuthService } from '@/frontend/services';

interface ProfileApiResponse {
  success: boolean;
  data?: IPerfilFotografo;
  error?: string;
}

export default function PerfilPublicoPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();
  const [profile, setProfile] = useState<IPerfilFotografo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [shareLink, setShareLink] = useState('');
  const [shareMessage, setShareMessage] = useState<string | null>(null);
  const [qrDataUrl, setQrDataUrl] = useState<string | null>(null);
  const [generatingQr, setGeneratingQr] = useState(false);
  const [selectedQrTheme, setSelectedQrTheme] = useState<'midnight' | 'violet' | 'sand' | 'custom'>('midnight');
  const [qrColors, setQrColors] = useState({ dark: '#0f172a', light: '#ffffff' });
  const messageTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [cachedUser, setCachedUser] = useState<IUsuario | null>(null);
  const [cachedToken, setCachedToken] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('all');

  useEffect(() => {
    const profileId = Number(params?.id);
    if (!profileId) {
      setError("Perfil no encontrado");
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/profiles/${profileId}`);
        if (!response.ok) {
          throw new Error("No pudimos cargar el perfil");
        }

        const data: ProfileApiResponse = await response.json();
        if (data.success && data.data) {
          setProfile(data.data as IPerfilFotografo);
          setError(null);
        } else {
          throw new Error(data.error || "Perfil no disponible");
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : "Error inesperado");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [params]);

  useEffect(() => {
    if (typeof window === 'undefined' || !params?.id) return;
    setShareLink(`${window.location.origin}/perfil/${params.id}`);
  }, [params]);

  useEffect(() => {
    if (user) {
      setCachedUser(user);
      return;
    }
    const stored = AuthService.getStoredUser();
    if (stored) {
      setCachedUser(stored as IUsuario);
    }
  }, [user]);

  useEffect(() => {
    if (token) {
      setCachedToken(token);
      return;
    }
    const storedToken = AuthService.getToken();
    if (storedToken) {
      setCachedToken(storedToken);
    }
  }, [token]);

  useEffect(() => () => {
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
  }, []);

  useEffect(() => {
    if (!shareLink) {
      setQrDataUrl(null);
      return;
    }
    let cancelled = false;
    const generateQr = async () => {
      setGeneratingQr(true);
      try {
        const QRCode = (await import('qrcode')).default;
        const dataUrl = await QRCode.toDataURL(shareLink, {
          width: 320,
          margin: 1,
          color: {
            dark: qrColors.dark,
            light: qrColors.light,
          },
        });
        if (!cancelled) {
          setQrDataUrl(dataUrl);
        }
      } catch (error) {
        console.error('No se pudo generar el QR', error);
      } finally {
        if (!cancelled) {
          setGeneratingQr(false);
        }
      }
    };

    generateQr();
    return () => {
      cancelled = true;
    };
  }, [shareLink, qrColors]);

  const coverImage =
    profile?.urlFotoPortada ||
    'https://images.unsplash.com/photo-1528869802-4cf1a6e0fd5a?auto=format&fit=crop&w=1500&q=80';
  const avatarImage =
    profile?.urlFotoPerfil ||
    'https://images.unsplash.com/photo-1504593811423-6dd665756598?auto=format&fit=crop&w=400&q=80';

  const displayedCategories = useMemo(() => (
    profile?.categorias?.map((cat) => cat.categoria?.nombre).filter(Boolean) ?? []
  ), [profile?.categorias]);
  const displayedPackages = profile?.paquetes ?? [];

  // Filtrar álbumes visibles
  const visibleAlbums = useMemo(() => {
    return profile?.albums?.filter(album => album.visible) ?? [];
  }, [profile?.albums]);

  // Obtener todas las imágenes del portafolio (incluyendo las de álbumes)
  const allPortfolioImages = useMemo(() => {
    const directPortfolio = profile?.portafolio ?? profile?.portfolio ?? [];
    const albumImages = visibleAlbums.flatMap(album => album.imagenes ?? []);

    // Unir y eliminar duplicados por ID
    const allImages = [...directPortfolio, ...albumImages];
    const uniqueImages = Array.from(new Map(allImages.map(img => [img.id, img])).values());

    return uniqueImages.sort((a, b) => a.orden - b.orden);
  }, [profile?.portafolio, profile?.portfolio, visibleAlbums]);

  // Filtrar imágenes según el tab activo
  const displayedPortfolio = useMemo(() => {
    if (activeTab === 'all') {
      return allPortfolioImages;
    }
    const selectedAlbum = visibleAlbums.find(a => a.id.toString() === activeTab);
    return selectedAlbum?.imagenes ?? [];
  }, [activeTab, allPortfolioImages, visibleAlbums]);

  const heroStats = useMemo(() => [
    {
      label: 'Calificación',
      value: profile?.calificacionPromedio
        ? `${Number(profile.calificacionPromedio).toFixed(1)} ★`
        : 'Nueva',
    },
    { label: 'Proyectos', value: profile?.totalResenas ? `${profile.totalResenas}+` : '3+' },
    { label: 'Verificado', value: profile?.verificado ? 'Sí' : 'Pendiente' },
  ], [profile]);

  const shareTitle = profile?.nombrePublico
    ? `Portafolio de ${profile.nombrePublico}`
    : 'Portafolio FotoEvento';
  const shareText = profile
    ? `Descubre el portafolio de ${profile.nombrePublico ?? 'este fotógrafo'} en FotoEvento.`
    : 'Descubre este portafolio en FotoEvento.';

  const shareCategoryLabel = displayedCategories.slice(0, 3).join(' • ') || 'Fotografía de eventos';
  const shareBioSnippet = (profile?.biografia || 'Historias visuales con dirección editorial y entrega impecable.').slice(0, 160);

  const baseHashtags = useMemo(() => {
    const tags = ['FotoEvento', 'FotografiaProfesional', 'HechoEnBolivia'];
    if (profile?.ubicacion) {
      tags.push(profile.ubicacion.replace(/\s+/g, ''));
    }
    displayedCategories.slice(0, 2).forEach((cat) => {
      if (cat) tags.push(cat.replace(/\s+/g, ''));
    });
    return Array.from(new Set(tags));
  }, [displayedCategories, profile?.ubicacion]);

  const shareCopyPresets = useMemo(() => {
    const formatHashtags = () => baseHashtags.map((tag) => `#${tag}`).join(' ');
    return [
      {
        channel: 'Instagram',
        tone: 'Emocional',
        text: `✨ ${profile?.nombrePublico ?? 'Este estudio'} captura historias con ${shareCategoryLabel.toLowerCase()}.\n\n${shareBioSnippet}\.\n\nReserva tu fecha aquí: ${shareLink}\n\n${formatHashtags()}`,
      },
      {
        channel: 'LinkedIn',
        tone: 'Profesional',
        text: `Confía la cobertura de tu próximo evento corporativo a ${profile?.nombrePublico ?? 'un estudio verificado'} en FotoEvento. Experiencia en ${shareCategoryLabel.toLowerCase()} y entregas puntuales. Agenda una llamada: ${shareLink}\n\n${formatHashtags()}`,
      },
      {
        channel: 'WhatsApp',
        tone: 'Directo',
        text: `Hola 👋 Soy ${profile?.nombrePublico ?? 'tu fotógrafo de confianza'}. Te comparto mi portafolio y paquetes actualizados: ${shareLink}\n¿Coordinamos tu evento? ${formatHashtags()}`,
      },
    ];
  }, [baseHashtags, profile?.nombrePublico, shareCategoryLabel, shareBioSnippet, shareLink]);

  const scheduleShareMessage = (text: string) => {
    setShareMessage(text);
    if (messageTimeoutRef.current) {
      clearTimeout(messageTimeoutRef.current);
    }
    messageTimeoutRef.current = setTimeout(() => setShareMessage(null), 4000);
  };

  const handleCopyLink = async () => {
    if (!shareLink || typeof navigator === 'undefined') return;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API no disponible');
      }
      await navigator.clipboard.writeText(shareLink);
      scheduleShareMessage('Enlace copiado al portapapeles ✅');
    } catch (err) {
      console.error('No se pudo copiar el enlace', err);
      scheduleShareMessage('No pudimos copiar automáticamente. Usa copiar manual.');
    }
  };

  const handleNativeShare = async () => {
    if (!shareLink || typeof navigator === 'undefined') {
      await handleCopyLink();
      return;
    }
    const advancedNavigator = navigator as Navigator & {
      share?: (data: ShareData) => Promise<void>;
    };
    if (!advancedNavigator.share) {
      await handleCopyLink();
      return;
    }
    try {
      await advancedNavigator.share({ title: shareTitle, text: shareText, url: shareLink });
      scheduleShareMessage('Compartido con tu aplicación favorita 📲');
    } catch (error) {
      if ((error as DOMException)?.name !== 'AbortError') {
        await handleCopyLink();
      }
    }
  };

  const handleWhatsAppShare = () => {
    if (!shareLink || typeof window === 'undefined') return;
    const url = `https://wa.me/?text=${encodeURIComponent(`${shareText} ${shareLink}`)}`;
    window.open(url, '_blank', 'noopener,noreferrer');
    scheduleShareMessage('Abriendo WhatsApp…');
  };

  const handleEmailShare = () => {
    if (!shareLink || typeof window === 'undefined') return;
    const url = `mailto:?subject=${encodeURIComponent(shareTitle)}&body=${encodeURIComponent(`${shareText}\n${shareLink}`)}`;
    window.location.href = url;
  };

  const handleDownloadQr = () => {
    if (!qrDataUrl || typeof document === 'undefined') return;
    const link = document.createElement('a');
    link.href = qrDataUrl;
    link.download = `${profile?.nombrePublico?.replace(/\s+/g, '-') ?? 'fotoevento'}-qr.png`;
    link.click();
    scheduleShareMessage('Descargaste tu código QR 📎');
  };

  const handleDownloadBanner = () => {
    if (!shareLink || typeof document === 'undefined') return;
    const escapeXml = (value: string) => value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
    const svg = `<?xml version="1.0" encoding="UTF-8"?>
<svg width="1200" height="628" viewBox="0 0 1200 628" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#1d4ed8" />
      <stop offset="100%" stop-color="#a855f7" />
    </linearGradient>
    <filter id="shadow" x="-20%" y="-20%" width="140%" height="140%">
      <feDropShadow dx="0" dy="12" stdDeviation="12" flood-color="#0f172a" flood-opacity="0.35" />
    </filter>
  </defs>
  <rect width="1200" height="628" fill="#0f172a" />
  <rect x="60" y="60" width="1080" height="508" rx="48" fill="url(#gradient)" filter="url(#shadow)" />
  <text x="120" y="170" font-size="44" font-family="'Inter', 'Segoe UI', sans-serif" fill="#fff" font-weight="600">${escapeXml(profile?.nombrePublico || profile?.usuario?.nombreCompleto || 'Portafolio FotoEvento')}</text>
  <text x="120" y="220" font-size="22" font-family="'Inter', sans-serif" fill="#e0e7ff">${escapeXml(shareCategoryLabel)}</text>
  <text x="120" y="280" font-size="72" font-family="'Inter', sans-serif" fill="#fff" font-weight="700">${escapeXml(heroStats[0].value || '⭐️')}</text>
  <text x="120" y="340" font-size="26" font-family="'Inter', sans-serif" fill="#f8fafc" opacity="0.9">${escapeXml(shareBioSnippet)}</text>
  <text x="120" y="420" font-size="24" font-family="'Inter', sans-serif" fill="#e0e7ff">Agenda desde FotoEvento</text>
  <text x="120" y="460" font-size="24" font-family="'Inter', sans-serif" fill="#fdf4ff">${escapeXml(shareLink)}</text>
  <text x="120" y="520" font-size="20" font-family="'Inter', sans-serif" fill="#cbd5f5">#${escapeXml(baseHashtags.slice(0, 4).join(' #'))}</text>
</svg>`;
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${profile?.nombrePublico?.replace(/\s+/g, '-') ?? 'fotoevento'}-banner.svg`;
    link.click();
    URL.revokeObjectURL(url);
    scheduleShareMessage('Banner descargado ✅');
  };

  const handleCopyPreset = async (text: string) => {
    if (typeof navigator === 'undefined') return;
    try {
      if (!navigator.clipboard?.writeText) {
        throw new Error('Clipboard API no disponible');
      }
      await navigator.clipboard.writeText(text);
      scheduleShareMessage('Copy listo para pegar ✍️');
    } catch (error) {
      console.error('No se pudo copiar el copy', error);
      scheduleShareMessage('No pudimos copiar automáticamente. Selecciona el texto manualmente.');
    }
  };

  const qrThemes: Record<'midnight' | 'violet' | 'sand', { dark: string; light: string }> = {
    midnight: { dark: '#0f172a', light: '#ffffff' },
    violet: { dark: '#4c1d95', light: '#faf5ff' },
    sand: { dark: '#854d0e', light: '#fef3c7' },
  };

  const contactEmail = profile?.usuario?.email;
  const contactPhone = profile?.usuario?.telefono;
  const sanitizedPhone = contactPhone?.replace(/\D/g, '');
  const canUseWhatsApp = Boolean(sanitizedPhone);

  const handleBookingNavigation = () => {
    // Intentar obtener el token de múltiples fuentes para asegurar que no sea un falso negativo
    const contextToken = token;
    const serviceToken = AuthService.getToken();
    const localToken = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null;

    const effectiveToken = contextToken || serviceToken || localToken;
    const hasCurrentSession = Boolean(effectiveToken);

    if (hasCurrentSession) {
      // Si tenemos token pero no usuario, asumimos CLIENTE por defecto para no bloquear
      // La página de destino validará el token de todos modos
      const userRol = resolvedUser?.rol ?? 'CLIENTE';

      const target = userRol === 'CLIENTE'
        ? `/mis-reservas${bookingQuery}`
        : '/dashboard';

      router.push(target);
    } else {
      // Guardar la intención de reserva para después del registro/login
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('pending_booking', bookingQuery);
      }
      router.push('/registro');
    }
  };

  const handleContactNavigation = async () => {
    const currentToken = token || AuthService.getToken();
    const hasCurrentSession = Boolean(currentToken);

    if (!hasCurrentSession) {
      router.push('/login');
      return;
    }

    if (!profile) {
      return;
    }

    try {
      const response = await fetch('/api/conversations/start', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${currentToken}`
        },
        body: JSON.stringify({ fotografoId: profile.usuarioId })
      });

      const data = await response.json();

      if (data.success && data.data) {
        // Redirigir a la página de mensajes/conversaciones
        router.push('/mis-reservas#conversaciones');
      } else {
        console.error('Error al iniciar conversación:', data.error);
        alert('No se pudo iniciar la conversación. Intenta nuevamente.');
      }
    } catch (error) {
      console.error('Error al contactar fotógrafo:', error);
      alert('Error al iniciar la conversación');
    }
  };

  const resolvedUser = user ?? cachedUser;
  const hasSession = Boolean(token ?? cachedToken);
  const isAuthenticated = hasSession && Boolean(resolvedUser);
  const bookingQuery = profile?.id ? `?fotografoId=${profile.id}` : '';

  const handleMailTo = () => {
    if (!contactEmail || typeof window === 'undefined') {
      scheduleShareMessage('No tenemos un email público todavía 📭');
      return;
    }
    window.location.href = `mailto:${contactEmail}?subject=${encodeURIComponent('Solicitud de fotografía desde FotoEvento')}&body=${encodeURIComponent(`Hola ${profile?.nombrePublico ?? ''}, vi tu portafolio y me gustaría coordinar un proyecto. Te dejo más detalles aquí:`)}`;
  };

  const handleWhatsAppPing = () => {
    if (!canUseWhatsApp || typeof window === 'undefined') {
      scheduleShareMessage('Actualiza tu número para activar WhatsApp ✅');
      return;
    }
    const text = encodeURIComponent(`Hola ${profile?.nombrePublico ?? ''}! Descubrí tu portafolio en FotoEvento y quiero cotizar. ${shareLink}`);
    window.open(`https://wa.me/${sanitizedPhone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  const copyContactValue = async (value?: string | null, label?: string) => {
    if (!value || typeof navigator === 'undefined') {
      scheduleShareMessage('No tenemos ese dato público aún');
      return;
    }
    try {
      await navigator.clipboard.writeText(value);
      scheduleShareMessage(`${label ?? 'Dato'} copiado ✅`);
    } catch (error) {
      console.error('No se pudo copiar el contacto', error);
      scheduleShareMessage('No pudimos copiar. Puedes seleccionarlo manualmente.');
    }
  };

  const handleThemeSelect = (theme: 'midnight' | 'violet' | 'sand' | 'custom') => {
    setSelectedQrTheme(theme);
    if (theme !== 'custom') {
      setQrColors(qrThemes[theme]);
    }
  };

  const handleColorInput = (type: 'dark' | 'light', value: string) => {
    setQrColors((prev) => ({ ...prev, [type]: value }));
    setSelectedQrTheme('custom');
  };

  const isOwner = useMemo(() => {
    if (!profile || !user || authLoading) {
      return false;
    }
    return profile.usuarioId === user.id;
  }, [profile, user, authLoading]);

  const showOwnerToolkit = isOwner && Boolean(shareLink);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="text-6xl mb-4">📸</div>
          <p className="text-slate-500">Cargando portafolio...</p>
        </div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-slate-50 px-4">
        <div className="text-center max-w-md">
          <div className="text-6xl mb-4">😕</div>
          <h1 className="text-3xl font-semibold text-slate-900 mb-2">No pudimos encontrar este perfil</h1>
          <p className="text-slate-500 mb-6">{error || "El fotógrafo que buscas no está disponible en este momento"}</p>
          <Button onClick={() => router.push("/fotografos")}>
            Volver a la búsqueda
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-slate-50 min-h-screen">
      <header className="relative h-[420px]">
        <Image
          src={coverImage}
          alt={profile.nombrePublico || "Portada"}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/40 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 container mx-auto px-4 pb-10">
          <div className="flex flex-col lg:flex-row lg:items-end gap-6">
            <div className="flex items-end gap-4">
              <div className="w-32 h-32 rounded-3xl border-4 border-white overflow-hidden shadow-2xl relative">
                <Image
                  src={avatarImage}
                  alt={profile.nombrePublico || "Fotógrafo"}
                  fill
                  sizes="128px"
                  className="object-cover"
                />
              </div>
              <div className="text-white">
                <p className="text-sm uppercase tracking-[0.3em] text-blue-200">Fotógrafo profesional</p>
                <h1 className="text-4xl font-semibold mt-2">{profile.nombrePublico || profile.usuario?.nombreCompleto}</h1>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-white/80">
                  <span>📍 {profile.ubicacion || "Bolivia"}</span>
                  {profile.sitioWeb && (
                    <a href={profile.sitioWeb} target="_blank" rel="noreferrer" className="underline">
                      🌐 Sitio web
                    </a>
                  )}
                </div>
              </div>
            </div>
            <div className="flex gap-4 text-white">
              {heroStats.map((stat) => (
                <div key={stat.label} className="rounded-2xl border border-white/20 px-6 py-3 backdrop-blur">
                  <p className="text-2xl font-semibold">{stat.value}</p>
                  <p className="text-sm text-white/80">{stat.label}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-3">
              <Button
                variant="secondary"
                className="bg-white text-slate-900 hover:bg-white/90"
                onClick={handleBookingNavigation}
              >
                Solicitar disponibilidad
              </Button>
              <Button
                variant="outline"
                className="border-white text-white hover:bg-white/10"
                onClick={handleContactNavigation}
              >
                Contactar
              </Button>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12 space-y-10">
        {showOwnerToolkit && (
          <section className="space-y-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card padding="lg" className="bg-white border border-slate-200 shadow-sm">
                <div className="flex flex-col gap-4">
                  <div>
                    <p className="text-sm font-semibold text-blue-600">Compartir portafolio</p>
                    <p className="text-slate-500 text-sm mt-1">
                      Envía este enlace a tus clientes o compártelo en redes sociales.
                    </p>
                    <p className="text-xs text-slate-400 mt-2 break-all">{shareLink}</p>
                    {shareMessage && (
                      <p className="text-sm text-green-600 mt-2" role="status">
                        {shareMessage}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Button variant="primary" onClick={handleCopyLink} disabled={!shareLink}>
                      Copiar enlace
                    </Button>
                    <Button variant="outline" onClick={handleNativeShare} disabled={!shareLink}>
                      Compartir…
                    </Button>
                    <Button
                      variant="secondary"
                      className="bg-green-600 text-white hover:bg-green-700"
                      onClick={handleWhatsAppShare}
                      disabled={!shareLink}
                    >
                      WhatsApp
                    </Button>
                    <Button variant="secondary" onClick={handleEmailShare} disabled={!shareLink}>
                      Email
                    </Button>
                  </div>
                </div>
              </Card>

              <Card padding="lg" className="bg-white">
                <div className="flex flex-col gap-4 lg:flex-row">
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-blue-600">Kit de difusión</p>
                    <p className="text-slate-500 text-sm mb-3">Descarga un banner listo para redes o comparte tu QR.</p>
                    <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-indigo-900 to-purple-800 text-white p-6 h-full shadow-lg">
                      <p className="text-xs uppercase tracking-[0.4em] text-white/70">FotoEvento</p>
                      <h3 className="text-2xl font-semibold mt-3">{profile.nombrePublico || profile.usuario?.nombreCompleto}</h3>
                      <p className="text-sm text-white/80 mt-1">{shareCategoryLabel}</p>
                      <div className="mt-4 flex flex-wrap gap-4 text-sm">
                        <div>
                          <p className="text-white/60">Rating</p>
                          <p className="text-2xl font-semibold">{heroStats[0].value}</p>
                        </div>
                        <div>
                          <p className="text-white/60">Ubicación</p>
                          <p className="text-lg">{profile.ubicacion || 'Bolivia'}</p>
                        </div>
                      </div>
                      <p className="text-sm text-white/80 mt-6 line-clamp-3">{shareBioSnippet}</p>
                      <p className="text-xs text-white/60 mt-8 break-all">{shareLink}</p>
                    </div>
                  </div>
                  <div className="w-full lg:w-64 space-y-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500 mb-2">Estilo del QR</p>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(qrThemes).map(([key, value]) => (
                          <button
                            key={key}
                            type="button"
                            className={`flex-1 min-w-[90px] rounded-2xl border px-3 py-2 text-xs font-medium transition ${selectedQrTheme === key
                              ? 'border-slate-900 bg-slate-900 text-white'
                              : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            onClick={() => handleThemeSelect(key as 'midnight' | 'violet' | 'sand')}
                          >
                            <span className="block">{key === 'midnight' ? 'Midnight' : key === 'violet' ? 'Violeta' : 'Arena'}</span>
                            <span
                              className="mt-1 block h-2 rounded-full"
                              style={{ background: `linear-gradient(90deg, ${value.dark}, ${value.light})` }}
                            />
                          </button>
                        ))}
                        <button
                          type="button"
                          className={`flex-1 min-w-[90px] rounded-2xl border px-3 py-2 text-xs font-medium transition ${selectedQrTheme === 'custom'
                            ? 'border-slate-900 bg-slate-900 text-white'
                            : 'border-slate-200 bg-white text-slate-600'
                            }`}
                          onClick={() => handleThemeSelect('custom')}
                        >
                          Personalizado
                        </button>
                      </div>
                    </div>
                    {selectedQrTheme === 'custom' && (
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <label className="flex flex-col gap-1">
                          Color oscuro
                          <input
                            type="color"
                            value={qrColors.dark}
                            onChange={(e) => handleColorInput('dark', e.target.value)}
                            className="h-10 w-full cursor-pointer rounded border border-slate-200"
                          />
                        </label>
                        <label className="flex flex-col gap-1">
                          Fondo
                          <input
                            type="color"
                            value={qrColors.light}
                            onChange={(e) => handleColorInput('light', e.target.value)}
                            className="h-10 w-full cursor-pointer rounded border border-slate-200"
                          />
                        </label>
                      </div>
                    )}
                    <Button variant="secondary" className="w-full" onClick={handleDownloadBanner}>
                      Descargar banner (SVG)
                    </Button>
                    <Button
                      variant="outline"
                      className="w-full"
                      onClick={handleDownloadQr}
                      disabled={!qrDataUrl || generatingQr}
                    >
                      {generatingQr ? 'Generando QR…' : 'Descargar código QR'}
                    </Button>
                    <div className="border border-dashed rounded-2xl p-3 bg-slate-50 flex items-center justify-center h-40">
                      {qrDataUrl ? (
                        <Image
                          src={qrDataUrl}
                          alt="Código QR del portafolio"
                          width={180}
                          height={180}
                          className="h-full w-full object-contain"
                          unoptimized
                        />
                      ) : (
                        <p className="text-sm text-slate-500">Tu QR aparecerá aquí…</p>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            </div>

            <Card padding="lg" className="bg-white border border-slate-200 shadow-sm">
              <p className="text-sm font-semibold text-blue-600 mb-4">Copys sugeridos</p>
              <div className="grid gap-4 md:grid-cols-3">
                {shareCopyPresets.map((preset) => (
                  <div key={preset.channel} className="rounded-2xl bg-slate-50 border border-slate-200 p-4 flex flex-col gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-500">{preset.channel}</p>
                      <p className="text-sm text-slate-600">Tono {preset.tone}</p>
                    </div>
                    <textarea
                      readOnly
                      value={preset.text}
                      className="w-full h-40 text-sm p-3 rounded-xl border border-slate-200 bg-white focus:outline-none"
                    />
                    <Button size="sm" variant="outline" onClick={() => handleCopyPreset(preset.text)}>
                      Copiar copy
                    </Button>
                  </div>
                ))}
              </div>
            </Card>
          </section>
        )}

        <section className="grid gap-6 lg:grid-cols-[2fr_1fr]">
          <Card padding="lg" className="bg-white border border-slate-200 shadow-sm">
            <div className="flex flex-col gap-4">
              <div>
                <p className="text-sm font-semibold text-blue-600">Contacto directo</p>
                <h2 className="text-3xl font-semibold text-slate-900 mt-2">Coordina tu sesión en menos de un día</h2>
                <p className="text-slate-500 mt-2">
                  Comparte tu solicitud, agenda una llamada exploratoria o envía notas de voz. Respondemos en menos de 2 horas.
                </p>
              </div>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="border rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Email</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{contactEmail ?? 'Pendiente de configurar'}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="primary" onClick={handleMailTo} disabled={!contactEmail}>
                      Escribir correo
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyContactValue(contactEmail, 'Email')} disabled={!contactEmail}>
                      Copiar
                    </Button>
                  </div>
                </div>
                <div className="border rounded-2xl p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-slate-500">WhatsApp / Teléfono</p>
                  <p className="text-lg font-semibold text-slate-900 mt-1">{contactPhone ?? 'No registrado'}</p>
                  <div className="flex gap-2 mt-3">
                    <Button size="sm" variant="secondary" className="bg-green-600 text-white hover:bg-green-700" onClick={handleWhatsAppPing} disabled={!canUseWhatsApp}>
                      Mensaje inmediato
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => copyContactValue(contactPhone, 'Teléfono')} disabled={!contactPhone}>
                      Copiar
                    </Button>
                  </div>
                </div>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {[{
                  title: 'Agendar discovery call',
                  description: '30 minutos para entender tu evento y proponer moodboard.',
                }, {
                  title: 'Compartir moodboard',
                  description: 'Adjunta referencias o tu board de Pinterest para afinar estilo.',
                }, {
                  title: 'Contratos y pagos seguros',
                  description: 'Firmamos digital y liberamos pagos hasta finalizar la entrega.',
                }].map((item) => (
                  <div key={item.title} className="rounded-2xl bg-slate-50 border border-slate-200 p-4">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <p className="text-sm text-slate-500 mt-1">{item.description}</p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-3">
                <Button variant="primary" onClick={handleBookingNavigation}>Crear solicitud inmediata</Button>
                <Button variant="outline" onClick={() => copyContactValue(shareLink, 'Enlace al portafolio')}>
                  Copiar link del portafolio
                </Button>
              </div>
            </div>
          </Card>
        </section>

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <Card padding="lg" className="bg-white">
            <p className="text-sm font-semibold text-blue-600">Sobre el estudio</p>
            <h2 className="text-3xl font-semibold text-slate-900 mt-2">Narrativas visuales con propósito</h2>
            <p className="text-slate-600 mt-4 leading-relaxed">
              {profile.biografia ||
                "Ayudamos a parejas y marcas a contar historias auténticas con una estética editorial y cuidadosa dirección de arte. Disponibles para proyectos en toda Bolivia y sesiones de destino."}
            </p>
            {displayedCategories.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-6">
                {displayedCategories.map((category) => (
                  <span key={category} className="px-4 py-1.5 rounded-full bg-slate-100 text-slate-600 text-sm font-medium">
                    {category}
                  </span>
                ))}
              </div>
            )}
          </Card>

          <div className="space-y-4">
            <Card padding="lg">
              <h3 className="text-lg font-semibold text-slate-900 mb-3">Reserva segura</h3>
              <p className="text-sm text-slate-500">Firmamos contratos digitales y protegemos tus pagos hasta que el servicio se complete.</p>
            </Card>
          </div>
        </div>

        {displayedPackages.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">Paquetes recomendados</p>
                <h2 className="text-2xl font-semibold text-slate-900">Servicios listos para reservar</h2>
              </div>
              <Button variant="outline" onClick={handleBookingNavigation}>Solicitar cotización</Button>
            </div>
            <div className="grid md:grid-cols-2 gap-6">
              {displayedPackages.map((pack) => (
                <Card key={pack.id} padding="lg" className="flex flex-col justify-between">
                  <div>
                    <h3 className="text-xl font-semibold text-slate-900">{pack.titulo || pack.nombre}</h3>
                    <p className="text-slate-500 text-sm mt-2">{pack.descripcion || "Paquete completamente adaptable a tu evento."}</p>
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <p className="text-3xl font-semibold text-slate-900">
                      {pack.precio ? `${pack.precio.toLocaleString()} ${pack.moneda || "BOB"}` : "Bajo consulta"}
                    </p>
                    <Button variant="primary" onClick={handleBookingNavigation}>Reservar</Button>
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

        {displayedPortfolio.length > 0 && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">Portfolio</p>
                <h2 className="text-2xl font-semibold text-slate-900">Últimos proyectos</h2>
              </div>
              <Button variant="outline" onClick={handleBookingNavigation}>Agendar sesión</Button>
            </div>

            {/* Tabs de Álbumes */}
            {visibleAlbums.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-6 border-b border-slate-200 pb-1">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === 'all'
                    ? 'text-blue-600 bg-white border-b-2 border-blue-600 -mb-[2px]'
                    : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                    }`}
                >
                  Todo el portafolio
                </button>
                {visibleAlbums.map((album) => (
                  <button
                    key={album.id}
                    onClick={() => setActiveTab(album.id.toString())}
                    className={`px-4 py-2 text-sm font-medium rounded-t-lg transition-colors relative ${activeTab === album.id.toString()
                      ? 'text-blue-600 bg-white border-b-2 border-blue-600 -mb-[2px]'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'
                      }`}
                  >
                    {album.nombre}
                  </button>
                ))}
              </div>
            )}

            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {displayedPortfolio.map((shot) => (
                <div key={shot.id} className="relative group overflow-hidden rounded-3xl h-64">
                  <Image
                    src={shot.urlImagen}
                    alt={shot.descripcion || "Proyecto"}
                    fill
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    className="object-cover transition duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition flex items-end p-4">
                    <p className="text-white text-sm">{shot.descripcion || "Sesión especial"}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        <Card padding="lg" className="bg-gradient-to-br from-blue-600 to-purple-600 text-white">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
            <div>
              <p className="uppercase text-sm tracking-[0.3em] text-white/60">¿Listo para empezar?</p>
              <h3 className="text-3xl font-semibold mt-2">Cuéntanos qué necesitas y coordinaremos tu sesión en menos de 12 horas</h3>
              <p className="mt-3 text-white/80">Comparte fechas, moodboard o referencias y recibe una propuesta personalizada.</p>
            </div>
            <div className="flex gap-3">
              <Button variant="secondary" className="bg-white text-slate-900 hover:bg-white/90" onClick={handleBookingNavigation}>
                Crear solicitud
              </Button>
              {!isAuthenticated && (
                <Link href="/login">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">Iniciar sesión</Button>
                </Link>
              )}
            </div>
          </div>
        </Card>

        {/* Sección de Reseñas */}
        {profile?.usuarioId && (
          <section>
            <div className="mb-6">
              <p className="text-sm font-semibold text-blue-600">Reseñas</p>
              <h2 className="text-2xl font-semibold text-slate-900 mt-1">Lo que dicen nuestros clientes</h2>
              <p className="text-slate-500 mt-2">Opiniones reales de eventos que hemos cubierto</p>
            </div>
            <ReviewList fotografoId={profile.usuarioId} />
          </section>
        )}
      </main>
    </div>
  );
}
