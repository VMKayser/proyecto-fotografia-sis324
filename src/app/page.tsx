/**
 * 🌐 Página de Inicio
 */

'use client';

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button, Input, Card } from '@/components';
import { IPerfilFotografo, ICategoria } from '@/frontend/interfaces';

const defaultHeroStats = [
  { label: 'Fotógrafos verificados', value: '—', accent: 'text-blue-600' },
  { label: 'Eventos cubiertos', value: '—', accent: 'text-purple-600' },
  { label: 'Clientes felices', value: '—', accent: 'text-amber-500' },
];

const inspirationCategories = [
  { name: 'Bodas de destino', emoji: '💍', description: 'Cobertura completa de tu gran día' },
  { name: 'Retratos editoriales', emoji: '📰', description: 'Producciones para marcas y revistas' },
  { name: 'Productos & food', emoji: '🍽️', description: 'Contenido para ecommerce y restaurantes' },
  { name: 'Eventos corporativos', emoji: '🏢', description: 'Memorias profesionales para tu empresa' },
  { name: 'Familia & lifestyle', emoji: '👨‍👩‍👧', description: 'Sesiones íntimas llenas de emoción' },
  { name: 'Moda & campañas', emoji: '✨', description: 'Dirección artística y styling' },
];

const steps = [
  { title: 'Describe tu evento', detail: 'Fechas, estilo y tipo de sesión' },
  { title: 'Compara portfolios', detail: 'Filtra por estilo, reseñas y presupuesto' },
  { title: 'Reserva con confianza', detail: 'Pagos seguros y contratos digitales' },
];

export default function HomePage() {
  const router = useRouter();
  const [searchData, setSearchData] = useState({ ubicacion: '', categoriaId: '', categoriaLabel: '', fecha: '' });
  const [profiles, setProfiles] = useState<IPerfilFotografo[]>([]);
  const [loadingProfiles, setLoadingProfiles] = useState(true);
  const [categories, setCategories] = useState<ICategoria[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [marketplaceMetrics, setMarketplaceMetrics] = useState<{
    verifiedPhotographers: number;
    eventsCovered: number;
    averageRating: number;
  } | null>(null);

  useEffect(() => {
    const fetchProfiles = async () => {
      try {
        setLoadingProfiles(true);
        const response = await fetch('/api/profiles');
        if (!response.ok) return;
        const data = await response.json();
        const parsed = Array.isArray(data) ? data : [];
        setProfiles(parsed);
      } catch (error) {
        console.error('Error cargando perfiles destacados', error);
      } finally {
        setLoadingProfiles(false);
      }
    };

    fetchProfiles();
  }, []);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('/api/categories');
        if (!response.ok) return;
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error cargando categorías', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    fetchCategories();
  }, []);

  useEffect(() => {
    let cancelled = false;
    const controller = new AbortController();

    const fetchMetrics = async () => {
      try {
        const response = await fetch('/api/dashboard', { signal: controller.signal });
        if (!response.ok) return;
        const payload = await response.json();
        if (!cancelled && payload?.data) {
          setMarketplaceMetrics(payload.data);
        }
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return;
        console.warn('No se pudieron cargar las métricas globales', error);
      }
    };

    fetchMetrics();
    return () => {
      cancelled = true;
      controller.abort();
    };
  }, []);

  const handleSearch = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams();
    if (searchData.ubicacion) params.set('ubicacion', searchData.ubicacion);
    if (searchData.categoriaId) {
      params.set('categoriaId', searchData.categoriaId);
      if (searchData.categoriaLabel) {
        params.set('categoria', searchData.categoriaLabel);
      }
    }
    if (searchData.fecha) params.set('fecha', searchData.fecha);
    if (searchData.ubicacion) params.set('q', searchData.ubicacion);
    router.push(`/fotografos${params.toString() ? `?${params.toString()}` : ''}`);
  };

  const featuredProfiles = useMemo(() => profiles.slice(0, 3), [profiles]);

  const heroStats = useMemo(() => {
    const numberFormatter = new Intl.NumberFormat('es-BO');
    const formatNumber = (value?: number | null) => {
      if (typeof value !== 'number' || Number.isNaN(value)) return '—';
      return numberFormatter.format(value);
    };

    const formatRating = (value?: number | null) => {
      if (typeof value !== 'number' || value <= 0) return '—';
      return `${value.toFixed(1)}★`;
    };

    if (marketplaceMetrics) {
      return [
        { label: 'Fotógrafos verificados', value: formatNumber(marketplaceMetrics.verifiedPhotographers), accent: 'text-blue-600' },
        { label: 'Eventos cubiertos', value: formatNumber(marketplaceMetrics.eventsCovered), accent: 'text-purple-600' },
        { label: 'Clientes felices', value: formatRating(marketplaceMetrics.averageRating), accent: 'text-amber-500' },
      ];
    }

    if (profiles.length) {
      const verified = profiles.filter((profile) => profile.verificado).length;
      const totalReviews = profiles.reduce((acc, profile) => acc + (profile.totalResenas || 0), 0);
      const ratingAverage = profiles.reduce((acc, profile) => acc + (Number(profile.calificacionPromedio) || 0), 0) /
        (profiles.length || 1);

      return [
        { label: 'Fotógrafos verificados', value: formatNumber(verified || profiles.length), accent: 'text-blue-600' },
        { label: 'Eventos cubiertos', value: formatNumber(Math.max(totalReviews, profiles.length * 4)), accent: 'text-purple-600' },
        { label: 'Clientes felices', value: formatRating(ratingAverage), accent: 'text-amber-500' },
      ];
    }

    return defaultHeroStats;
  }, [profiles, marketplaceMetrics]);

  const handleCategorySelect = (value: string) => {
    const selected = categories.find((cat) => cat.id.toString() === value);
    setSearchData((prev) => ({
      ...prev,
      categoriaId: value,
      categoriaLabel: selected?.nombre ?? '',
    }));
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <section className="bg-gradient-to-br from-blue-50 via-white to-purple-50">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            <div className="order-2 lg:order-1">
              <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-white rounded-full shadow-sm border border-slate-200 text-xs sm:text-sm font-medium text-blue-700">
                <span className="text-sm sm:text-base">✨</span> 
                <span className="hidden sm:inline">Plataforma líder en Bolivia</span>
                <span className="sm:hidden">Líder en Bolivia</span>
              </div>
              <h1 className="mt-4 sm:mt-6 text-3xl sm:text-4xl lg:text-6xl font-semibold text-slate-900 leading-tight">
                Capturamos tus momentos con fotógrafos que entienden tu estilo
              </h1>
              <p className="mt-4 sm:mt-6 text-base sm:text-lg text-slate-600 max-w-2xl">
                Compara portafolios curados, descubre paquetes pensados para cada tipo de evento y reserva
                con contratos digitales en minutos.
              </p>
              <div className="mt-6 sm:mt-10 flex flex-col sm:flex-row gap-3 sm:gap-4">
                <Link href="/fotografos" className="w-full sm:w-auto">
                  <Button variant="primary" size="lg" className="w-full sm:w-auto">
                    Explorar fotógrafos
                  </Button>
                </Link>
                <Link href="/registro" className="w-full sm:w-auto">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Soy fotógrafo/a
                  </Button>
                </Link>
              </div>

              <div className="mt-8 sm:mt-12 grid grid-cols-3 gap-2 sm:gap-4">
                {heroStats.map((stat) => (
                  <div key={stat.label} className="bg-white p-3 sm:p-4 rounded-xl sm:rounded-2xl shadow border border-slate-100 transition-transform hover:scale-105">
                    <p className={`text-xl sm:text-2xl lg:text-3xl font-semibold ${stat.accent}`}>{stat.value}</p>
                    <p className="text-xs sm:text-sm text-slate-500 mt-1 line-clamp-2">{stat.label}</p>
                  </div>
                ))}
              </div>
            </div>

            <Card className="relative border-0 shadow-2xl bg-white/90 backdrop-blur order-1 lg:order-2">
              <div className="absolute -left-4 sm:-left-6 -top-4 sm:-top-6 w-8 sm:w-12 h-8 sm:h-12 rounded-xl sm:rounded-2xl bg-purple-100 animate-pulse" />
              <div className="absolute -right-3 sm:-right-4 -bottom-3 sm:-bottom-4 w-12 sm:w-16 h-12 sm:h-16 rounded-full bg-blue-100 animate-pulse delay-75" />
              <div className="relative p-4 sm:p-6">
                <p className="text-xs sm:text-sm font-semibold text-blue-600 mb-2">Planifica tu sesión</p>
                <h3 className="text-xl sm:text-2xl font-semibold text-slate-900 mb-4 sm:mb-6 leading-snug">
                  Cuéntanos qué necesitas y te llevamos a un match perfecto
                </h3>
                <form onSubmit={handleSearch} className="space-y-3 sm:space-y-4">
                  <Input
                    label="¿Dónde será el evento?"
                    placeholder="La Paz, Santa Cruz, Cochabamba..."
                    value={searchData.ubicacion}
                    onChange={(value) => setSearchData((prev) => ({ ...prev, ubicacion: value }))}
                  />
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                    <select
                      value={searchData.categoriaId}
                      onChange={(event) => handleCategorySelect(event.target.value)}
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="">Cualquiera</option>
                      {categories.map((category) => (
                        <option key={category.id} value={category.id.toString()}>
                          {category.nombre}
                        </option>
                      ))}
                    </select>
                    {loadingCategories && (
                      <p className="text-xs text-slate-400 mt-1">Actualizando catálogo…</p>
                    )}
                  </div>
                  <Input
                    label="Fecha aproximada"
                    type="date"
                    value={searchData.fecha}
                    onChange={(value) => setSearchData((prev) => ({ ...prev, fecha: value }))}
                  />
                  <Button type="submit" variant="primary" size="lg" className="w-full">
                    Buscar fotógrafos disponibles
                  </Button>
                </form>
                <p className="text-xs text-slate-500 mt-4">
                  🔒 Protegemos tus datos. Solo compartimos tu información con fotógrafos confirmados.
                </p>
              </div>
            </Card>
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {inspirationCategories.map((category) => (
            <div
              key={category.name}
              className="p-4 sm:p-6 bg-white rounded-xl sm:rounded-2xl border border-slate-100 shadow-sm hover:-translate-y-1 hover:shadow-lg transition-all cursor-pointer"
            >
              <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">{category.emoji}</div>
              <h3 className="text-lg sm:text-xl font-semibold text-slate-900">{category.name}</h3>
              <p className="text-slate-500 text-xs sm:text-sm mt-1 sm:mt-2">{category.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-slate-900">
        <div className="container mx-auto px-4 py-8 sm:py-12 lg:py-16">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 sm:gap-10">
            <div>
              <p className="text-blue-300 text-xs sm:text-sm uppercase tracking-widest">Cómo funciona</p>
              <h2 className="mt-2 sm:mt-3 text-2xl sm:text-3xl lg:text-4xl font-semibold text-white">
                Un proceso diseñado para que organizar tus sesiones sea simple y seguro
              </h2>
            </div>
            <Link href="/registro" className="w-full sm:w-auto">
              <Button variant="secondary" size="lg" className="w-full sm:w-auto">
                Crear cuenta
              </Button>
            </Link>
          </div>
          <div className="mt-8 sm:mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {steps.map((step, index) => (
              <div
                key={step.title}
                className="p-4 sm:p-6 rounded-xl sm:rounded-2xl border border-white/10 bg-white/5 backdrop-blur hover:bg-white/10 transition-colors"
              >
                <span className="text-white/60 text-xs sm:text-sm">Paso {index + 1}</span>
                <h3 className="text-lg sm:text-xl font-semibold text-white mt-2">{step.title}</h3>
                <p className="text-white/70 mt-1 text-xs sm:text-sm">{step.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="flex items-center justify-between gap-6 flex-wrap">
          <div>
            <p className="text-sm font-semibold text-blue-600">Perfiles destacados</p>
            <h2 className="text-3xl font-semibold text-slate-900 mt-2">
              Portafolios seleccionados por nuestro equipo
            </h2>
          </div>
          <Link href="/fotografos">
            <Button variant="outline">Ver todos</Button>
          </Link>
        </div>

        <div className="grid md:grid-cols-3 gap-6 mt-10">
          {loadingProfiles && (
            <div className="md:col-span-3 text-center py-16 text-slate-500">Cargando perfiles...</div>
          )}
          {!loadingProfiles && featuredProfiles.length === 0 && (
            <div className="md:col-span-3 text-center py-16 text-slate-500">
              Aún no tenemos perfiles destacados, vuelve pronto ✨
            </div>
          )}
          {featuredProfiles.map((profile) => (
            <Card key={profile.id} hover className="overflow-hidden flex flex-col">
              <div className="h-48 bg-gradient-to-br from-blue-100 to-purple-100 relative flex-shrink-0">
                <div className="absolute top-4 right-4 bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-700 shadow-sm">
                  {profile.ubicacion || 'Bolivia'}
                </div>
              </div>
              <div className="relative -mt-10 px-6 pb-4 z-10">
                <div className="w-20 h-20 rounded-2xl border-4 border-white bg-gradient-to-br from-blue-500 to-purple-500 shadow-lg flex items-center justify-center text-4xl">
                  📷
                </div>
              </div>
              <div className="px-6 pb-6 flex-grow flex flex-col">
                <div className="flex items-start justify-between gap-4 flex-grow">
                  <div className="flex-grow min-w-0">
                    <h3 className="text-xl font-semibold text-slate-900 truncate">
                      {profile.nombrePublico || `Fotógrafo #${profile.id}`}
                    </h3>
                    <p className="text-sm text-slate-500 line-clamp-2 mt-1">
                      {profile.biografia?.slice(0, 80) || 'Especialista en eventos y retratos'}
                    </p>
                  </div>
                  {profile.calificacionPromedio > 0 && (
                    <div className="text-right flex-shrink-0">
                      <p className="text-lg font-semibold text-amber-500 whitespace-nowrap">
                        {Number(profile.calificacionPromedio).toFixed(1)} ★
                      </p>
                      <p className="text-xs text-slate-400 whitespace-nowrap">{profile.totalResenas} reseñas</p>
                    </div>
                  )}
                </div>

                <div className="mt-6">
                  <Link href={`/perfil/${profile.id}`}>
                    <Button variant="primary" className="w-full">
                      Ver portafolio completo
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      <section className="container mx-auto px-4 py-16">
        <div className="grid lg:grid-cols-2 gap-10">
          <Card className="p-8 bg-gradient-to-br from-blue-600 to-purple-600 text-white">
            <h3 className="text-3xl font-semibold">¿Eres fotógrafo o estudio?</h3>
            <p className="mt-4 text-white/80">
              Crea paquetes, gestiona reservas y recibe pagos asegurados. Nuestro marketplace te conecta con clientes
              que valoran tu estilo.
            </p>
            <ul className="mt-6 space-y-2 text-white/80 text-sm">
              <li>• Portafolio interactivo y reseñas verificadas</li>
              <li>• Panel de reservas con contratos digitales</li>
              <li>• Herramientas para paquetes y upselling</li>
            </ul>
            <div className="mt-8">
              <Link href="/registro">
                <Button variant="secondary" size="lg">
                  Crear perfil profesional
                </Button>
              </Link>
            </div>
          </Card>

          <Card className="p-8 bg-white">
            <p className="text-sm font-semibold text-blue-600">Testimonios</p>
            <h3 className="text-2xl font-semibold text-slate-900 mt-2">
              Equipos creativos que ya confían en nosotros
            </h3>
            <div className="mt-6 space-y-6">
              {[
                {
                  quote:
                    'Reservar con FotoBolivia nos permitió asegurar cobertura de última hora con un equipo increíble. El proceso fue transparente y súper ágil.',
                  author: 'María Beltrán',
                  role: 'Wedding Planner - La Paz',
                },
                {
                  quote:
                    'Como estudio fotográfico ahora recibimos clientes mejor calificados y con solicitudes claras. El dashboard nos ahorra horas cada semana.',
                  author: 'Estudio Prisma',
                  role: 'Fotografía editorial - SCZ',
                },
              ].map((testimonial) => (
                <div key={testimonial.author} className="border border-slate-100 rounded-2xl p-6">
                  <p className="text-slate-600 italic">“{testimonial.quote}”</p>
                  <div className="mt-4">
                    <p className="text-slate-900 font-semibold">{testimonial.author}</p>
                    <p className="text-sm text-slate-500">{testimonial.role}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
