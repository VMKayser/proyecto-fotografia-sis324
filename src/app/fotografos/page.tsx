/**
 * 📸 Página de Fotógrafos
 */

'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useSearchParams } from 'next/navigation';
import { IPerfilFotografo, ICategoria } from '@/frontend/interfaces';
import { Button, Card, Input } from '@/components';
import { useAuth } from '@/hooks';

const ratingSteps = [0, 3, 4, 4.5];
const sortOptions = [
  { value: 'recomendados', label: 'Recomendados' },
  { value: 'rating', label: 'Mejor calificados' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'recientes', label: 'Más recientes' },
] as const;

type FilterState = {
  keyword: string;
  categoriaId: string;
  fechaDisponible: string;
  minRating: number;
  onlyVerified: boolean;
  priceMin: string;
  priceMax: string;
  orden: (typeof sortOptions)[number]['value'];
};

export default function FotografosPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <div className="text-center space-y-3">
            <div className="text-4xl">🔍</div>
            <p className="text-slate-500">Cargando resultados…</p>
          </div>
        </div>
      }
    >
      <FotografosContent />
    </Suspense>
  );
}

function FotografosContent() {
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const [profiles, setProfiles] = useState<IPerfilFotografo[]>([]);
  const [loading, setLoading] = useState(true);
  const [categories, setCategories] = useState<ICategoria[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [filters, setFilters] = useState<FilterState>(() => {
    const minRatingParam = searchParams.get('minRating');
    const parsedMin = minRatingParam ? Number(minRatingParam) : 0;
    const ordenParam = (searchParams.get('orden') || searchParams.get('ordenarPor')) as FilterState['orden'] | null;
    return {
      keyword: searchParams.get('q') || searchParams.get('ubicacion') || '',
      categoriaId: searchParams.get('categoriaId') || '',
      fechaDisponible: searchParams.get('fechaDisponible') || searchParams.get('fecha') || '',
      minRating: Number.isNaN(parsedMin) ? 0 : parsedMin,
      onlyVerified: searchParams.get('soloVerificados') === 'true',
      priceMin: searchParams.get('precioMin') || '',
      priceMax: searchParams.get('precioMax') || '',
      orden: ordenParam && sortOptions.some((option) => option.value === ordenParam) ? ordenParam : 'recomendados',
    };
  });

  useEffect(() => {
    const minRatingParam = searchParams.get('minRating');
    const parsedMin = minRatingParam ? Number(minRatingParam) : 0;
    setFilters((prev) => ({
      ...prev,
      keyword: searchParams.get('q') || searchParams.get('ubicacion') || '',
      categoriaId: searchParams.get('categoriaId') || '',
      fechaDisponible: searchParams.get('fechaDisponible') || searchParams.get('fecha') || '',
      minRating: Number.isNaN(parsedMin) ? prev.minRating : parsedMin,
      onlyVerified: searchParams.get('soloVerificados') === 'true',
      priceMin: searchParams.get('precioMin') || prev.priceMin,
      priceMax: searchParams.get('precioMax') || prev.priceMax,
      orden: (searchParams.get('orden') as FilterState['orden']) || prev.orden,
    }));
  }, [searchParams]);

  useEffect(() => {
    const controller = new AbortController();
    const timeout = setTimeout(async () => {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (filters.keyword) {
          params.set('q', filters.keyword);
        }
        if (filters.categoriaId) {
          params.set('categoriaId', filters.categoriaId);
        }
        if (filters.minRating) {
          params.set('minRating', filters.minRating.toString());
        }
        if (filters.onlyVerified) {
          params.set('soloVerificados', 'true');
        }
        if (filters.fechaDisponible) {
          params.set('fechaDisponible', filters.fechaDisponible);
        }
        const priceMinValue = Number(filters.priceMin);
        if (!Number.isNaN(priceMinValue) && priceMinValue > 0) {
          params.set('precioMin', priceMinValue.toString());
        }
        const priceMaxValue = Number(filters.priceMax);
        if (!Number.isNaN(priceMaxValue) && priceMaxValue > 0) {
          params.set('precioMax', priceMaxValue.toString());
        }
        if (filters.orden && filters.orden !== 'recomendados') {
          params.set('orden', filters.orden);
        }

        const url = `/api/profiles${params.toString() ? `?${params.toString()}` : ''}`;
        const response = await fetch(url, { signal: controller.signal });
        if (response.ok) {
          const data = await response.json();
          setProfiles(Array.isArray(data) ? data : []);
        } else {
          setProfiles([]);
        }
      } catch (error) {
        if ((error as DOMException)?.name === 'AbortError') return;
        console.error('Error al cargar fotógrafos:', error);
        setProfiles([]);
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }, 350);

    return () => {
      controller.abort();
      clearTimeout(timeout);
    };
  }, [filters]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setLoadingCategories(true);
        const response = await fetch('/api/categories');
        if (!response.ok) return;
        const data = await response.json();
        setCategories(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error al cargar categorías:', error);
      } finally {
        setLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const activeFilters = useMemo(() => {
    const chips: string[] = [];
    if (filters.keyword) chips.push(`Búsqueda: ${filters.keyword}`);
    if (filters.categoriaId) {
      const categoryName = categories.find((cat) => cat.id.toString() === filters.categoriaId)?.nombre;
      if (categoryName) chips.push(`Categoría: ${categoryName}`);
    }
    if (filters.minRating) chips.push(`≥ ${filters.minRating}★`);
    if (filters.onlyVerified) chips.push('Solo verificados');
    if (filters.priceMin) chips.push(`Desde Bs ${filters.priceMin}`);
    if (filters.priceMax) chips.push(`Hasta Bs ${filters.priceMax}`);
    if (filters.fechaDisponible) chips.push(`Disponible: ${filters.fechaDisponible}`);
    if (filters.orden && filters.orden !== 'recomendados') {
      const label = sortOptions.find((option) => option.value === filters.orden)?.label;
      if (label) chips.push(label);
    }
    return chips;
  }, [filters, categories]);

  const resetFilters = () => {
    setFilters({
      keyword: '',
      categoriaId: '',
      fechaDisponible: '',
      minRating: 0,
      onlyVerified: false,
      priceMin: '',
      priceMax: '',
      orden: 'recomendados',
    });
  };

  return (
    <div className="bg-slate-50 min-h-screen">
      <div className="border-b border-slate-100 bg-white py-12">
        <div className="container mx-auto px-4">
          <p className="text-sm font-semibold text-blue-700">Encuentra a tu fotógrafo</p>
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mt-3">
            <h1 className="text-4xl lg:text-5xl font-semibold text-slate-900 leading-tight">
              Portafolios de fotógrafos para tu evento
            </h1>
            <Link href="/registro">
              <Button variant="outline">Soy fotógrafo/a</Button>
            </Link>
          </div>
          <p className="mt-4 text-lg text-slate-600 max-w-3xl">
            Busca por estilo, opiniones y fotógrafos verificados para encontrar al profesional ideal para tu sesión.
          </p>
          {activeFilters.length > 0 && (
            <div className="flex flex-wrap gap-3 mt-6">
              {activeFilters.map((chip) => (
                <span key={chip} className="px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-sm font-medium">
                  {chip}
                </span>
              ))}
              <button onClick={resetFilters} className="text-sm text-slate-500 underline">
                Limpiar filtros
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="container mx-auto px-4 py-12 grid lg:grid-cols-[320px_1fr] gap-10">
        <Card className="self-start lg:sticky lg:top-24" padding="lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-slate-900">Filtros avanzados</h2>
            <button onClick={resetFilters} className="text-sm text-slate-500 hover:text-slate-700">
              Reiniciar
            </button>
          </div>

          <div className="space-y-6">
            <Input
              label="Ubicación o palabra clave"
              placeholder="La Paz, SCZ, Ana Pérez..."
              value={filters.keyword}
              onChange={(value) => setFilters((prev) => ({ ...prev, keyword: value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
              <select
                value={filters.categoriaId}
                onChange={(event) => setFilters((prev) => ({ ...prev, categoriaId: event.target.value }))}
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Todas</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id.toString()}>
                    {category.nombre}
                  </option>
                ))}
              </select>
              {loadingCategories && (
                <p className="text-xs text-slate-400 mt-1">Cargando listados…</p>
              )}
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Calificación mínima</p>
              <div className="flex flex-wrap gap-2">
                {ratingSteps.map((rating) => (
                  <button
                    key={rating}
                    onClick={() => setFilters((prev) => ({ ...prev, minRating: rating }))}
                    className={`px-3 py-1.5 rounded-full border text-sm ${filters.minRating === rating
                      ? 'bg-blue-600 text-white border-blue-600'
                      : 'border-slate-200 text-slate-600 hover:border-slate-400'
                      }`}
                  >
                    {rating === 0 ? 'Cualquiera' : `${rating}+ ★`}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex items-center justify-between border rounded-lg px-4 py-3">
              <div>
                <p className="text-sm font-medium text-slate-700">Solo perfiles verificados</p>
                <p className="text-xs text-slate-500">Documentación revisada por el equipo FotoBolivia</p>
              </div>
              <button
                onClick={() => setFilters((prev) => ({ ...prev, onlyVerified: !prev.onlyVerified }))}
                className={`w-12 h-6 rounded-full p-1 transition ${filters.onlyVerified ? 'bg-blue-600' : 'bg-slate-300'
                  }`}
              >
                <span
                  className={`block w-4 h-4 rounded-full bg-white transition ${filters.onlyVerified ? 'translate-x-6' : 'translate-x-0'
                    }`}
                />
              </button>
            </div>

            <div>
              <p className="text-sm font-medium text-slate-700 mb-3">Rango de inversión (Bs)</p>
              <div className="grid grid-cols-2 gap-3">
                <Input
                  label="Mínimo"
                  type="number"
                  value={filters.priceMin}
                  onChange={(value) => setFilters((prev) => ({ ...prev, priceMin: value }))}
                  placeholder="500"
                />
                <Input
                  label="Máximo"
                  type="number"
                  value={filters.priceMax}
                  onChange={(value) => setFilters((prev) => ({ ...prev, priceMax: value }))}
                  placeholder="3000"
                />
              </div>
            </div>

            <Input
              label="Fecha tentativa"
              type="date"
              value={filters.fechaDisponible}
              onChange={(value) => setFilters((prev) => ({ ...prev, fechaDisponible: value }))}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                value={filters.orden}
                onChange={(event) =>
                  setFilters((prev) => ({ ...prev, orden: event.target.value as FilterState['orden'] }))
                }
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                {sortOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-sm text-slate-600">
              <p className="font-semibold text-slate-800">Tip</p>
              <p className="mt-1">
                Usa palabras clave como “editorial”, “destino”, “gastronomía” o “branding” para filtrar por estilo específico.
              </p>
            </div>
          </div>
        </Card>

        <div>
          <div className="flex items-center justify-between mb-6">
            <p className="text-sm text-slate-500">
              {loading ? 'Buscando perfiles disponibles…' : `${profiles.length} fotógrafos disponibles`}
            </p>
            <button type="button" onClick={() => resetFilters()} className="text-sm text-blue-600">
              Reiniciar filtros
            </button>
          </div>

          {loading ? (
            <div className="text-center text-slate-500 py-20">Cargando fotógrafos...</div>
          ) : profiles.length === 0 ? (
            <Card padding="lg" className="text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-2xl font-semibold text-slate-900">No hay coincidencias</h3>
              <p className="text-slate-500 mt-2">Ajusta tus filtros o intenta con otra palabra clave</p>
            </Card>
          ) : (
            <div className="space-y-6">
              {profiles.map((profile) => {
                const paquetes = profile.paquetes || [];
                const priceValues = paquetes
                  .map((pkg) => Number(pkg.precio))
                  .filter((value) => !Number.isNaN(value) && value > 0);
                const startingPrice = priceValues.length > 0 ? Math.min(...priceValues) : null;

                return (
                  <Card key={profile.id} padding="lg" className="hover:-translate-y-1 transition-all relative">
                    {/* 🌟 BADGE DESTACADO */}
                    {profile.destacadoHasta && new Date(profile.destacadoHasta) > new Date() && (
                      <div className="absolute top-4 right-4 z-10">
                        <div className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white px-4 py-2 rounded-full shadow-lg flex items-center gap-2 font-bold text-sm">
                          <span>⭐</span>
                          <span>DESTACADO</span>
                        </div>
                      </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                      <div className="md:w-1/3">
                        <div className="h-48 rounded-2xl bg-gradient-to-br from-blue-100 to-purple-100 relative overflow-hidden">
                          {profile.urlFotoPortada && (
                            <Image
                              src={profile.urlFotoPortada}
                              alt={profile.nombrePublico || 'Fotógrafo'}
                              fill
                              sizes="(max-width: 768px) 100vw, 33vw"
                              className="object-cover"
                            />
                          )}
                          <div className="absolute bottom-3 left-3 bg-white px-3 py-1 rounded-full text-xs font-semibold text-slate-700">
                            {profile.ubicacion || 'Bolivia'}
                          </div>
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex flex-wrap items-start gap-4 justify-between">
                          <div>
                            <p className="text-sm uppercase tracking-widest text-blue-500 font-semibold">
                              {profile.verificado ? 'Perfil verificado' : 'Perfil recomendado'}
                            </p>
                            <h3 className="text-2xl font-semibold text-slate-900">
                              {profile.nombrePublico || `Fotógrafo #${profile.id}`}
                            </h3>
                            <p className="text-slate-500 mt-1 max-w-2xl">
                              {profile.biografia || 'Especialista en sesiones personalizadas y cobertura integral de eventos.'}
                            </p>
                          </div>
                          {profile.calificacionPromedio > 0 && (
                            <div className="text-right">
                              <p className="text-3xl font-semibold text-amber-500">
                                {Number(profile.calificacionPromedio).toFixed(1)}
                              </p>
                              <p className="text-xs text-slate-500">{profile.totalResenas} reseñas</p>
                            </div>
                          )}
                        </div>

                        {profile.categorias && profile.categorias.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-4">
                            {profile.categorias.slice(0, 4).map((cat) => (
                              <span
                                key={cat.id}
                                className="px-3 py-1 rounded-full bg-slate-100 text-slate-600 text-xs font-medium"
                              >
                                {cat.categoria?.nombre || 'Categoría'}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="mt-6 flex flex-wrap gap-3 items-center">
                          {startingPrice !== null && (
                            <span className="px-3 py-1 rounded-full bg-green-50 text-green-700 text-sm font-semibold">
                              Desde Bs {startingPrice.toLocaleString('es-BO')}
                            </span>
                          )}
                          <Link href={`/perfil/${profile.id}`}>
                            <Button variant="primary">Ver perfil completo</Button>
                          </Link>
                          {user && user.rol === 'CLIENTE' ? (
                            <Link href={`/perfil/${profile.id}`}>
                              <Button variant="outline">
                                {startingPrice !== null ? 'Ver paquetes y reservar' : 'Solicitar cotización'}
                              </Button>
                            </Link>
                          ) : (
                            <Link href="/registro">
                              <Button variant="outline">
                                {startingPrice !== null ? 'Ver paquetes y reservar' : 'Solicitar cotización'}
                              </Button>
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
