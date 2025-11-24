'use client';
/* eslint-disable @next/next/no-img-element */

import React, { useCallback, useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/hooks';
import { useRouter } from 'next/navigation';
import { Card, Input, Button } from '@/components';

type Category = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  icono?: string | null;
};

type PortfolioImage = {
  id: number;
  urlImagen: string;
  descripcion?: string | null;
  album?: string | null;
  albumId?: number | null;
  orden?: number;
  destacada?: boolean;
};

type Album = {
  id: number;
  nombre: string;
  descripcion?: string | null;
  portadaUrl?: string | null;
  orden: number;
  visible: boolean;
  imagenes?: PortfolioImage[];
};

type PhotographerCategory = {
  categoriaId: number;
};

type PhotographerProfile = {
  id: number;
  usuarioId: number;
  nombrePublico?: string | null;
  biografia?: string | null;
  ubicacion?: string | null;
  sitioWeb?: string | null;
  urlFotoPerfil?: string | null;
  urlFotoPortada?: string | null;
  urlDocumentoIdentidad?: string | null;
  qrPagoUrl?: string | null;
  qrInstrucciones?: string | null;
  destacadoHasta?: string | null;
  verificado?: boolean;
  categorias?: PhotographerCategory[];
  albums?: Album[];
  portafolio?: PortfolioImage[];
  paquetes?: { id: number }[];
  totalReservas?: number;
};

type ToastMessage = {
  type: 'success' | 'error' | '';
  text: string;
};

type ProfileFormData = {
  nombrePublico: string;
  biografia: string;
  ubicacion: string;
  sitioWeb: string;
  urlFotoPerfil: string;
  urlFotoPortada: string;
  urlDocumentoIdentidad: string;
  qrPagoUrl: string;
  qrInstrucciones: string;
};

type AlbumFormState = {
  nombre: string;
  descripcion: string;
};

type NewImageForm = {
  url: string;
  descripcion: string;
};

const DEFAULT_ALBUM = 'Sesiones destacadas';

export default function PerfilFotografoPage() {
  const { user, loading, token: authToken } = useAuth();
  const router = useRouter();
  const safeTrim = useCallback((value: unknown) => (typeof value === 'string' ? value.trim() : ''), []);
  const [profile, setProfile] = useState<PhotographerProfile | null>(null);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<ToastMessage>({ type: '', text: '' });
  const [formData, setFormData] = useState<ProfileFormData>({
    nombrePublico: '',
    biografia: '',
    ubicacion: '',
    sitioWeb: '',
    urlFotoPerfil: '',
    urlFotoPortada: '',
    urlDocumentoIdentidad: '',
    qrPagoUrl: '',
    qrInstrucciones: '',
  });
  const [portfolioImages, setPortfolioImages] = useState<PortfolioImage[]>([]);
  const [newImage, setNewImage] = useState<NewImageForm>({ url: '', descripcion: '' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [uploadingImage, setUploadingImage] = useState(false);
  const [qrFile, setQrFile] = useState<File | null>(null);
  const [uploadingQr, setUploadingQr] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<number[]>([]);
  const [savingCategories, setSavingCategories] = useState(false);
  const [albums, setAlbums] = useState<Album[]>([]);
  const [selectedAlbumId, setSelectedAlbumId] = useState<number | null>(null);
  const [albumForm, setAlbumForm] = useState<AlbumFormState>({ nombre: '', descripcion: '' });
  const [albumLoading, setAlbumLoading] = useState(false);
  const [profilePhotoFile, setProfilePhotoFile] = useState<File | null>(null);
  const [coverPhotoFile, setCoverPhotoFile] = useState<File | null>(null);
  const [uploadingProfilePhoto, setUploadingProfilePhoto] = useState(false);
  const [uploadingCoverPhoto, setUploadingCoverPhoto] = useState(false);
  const [documentFile, setDocumentFile] = useState<File | null>(null);
  const [uploadingDocument, setUploadingDocument] = useState(false);
  const attemptedAlbumBootstrap = useRef(false);

  const getAuthToken = useCallback(() => {
    if (authToken) return authToken;
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
  }, [authToken]);

  const buildAuthHeaders = useCallback((withJson = true) => {
    const token = getAuthToken();
    const headers: Record<string, string> = {};
    if (withJson) {
      headers['Content-Type'] = 'application/json';
    }
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }, [getAuthToken]);

  const createAlbumOnServer = useCallback(async (nombre: string, descripcion?: string) => {
    try {
      setAlbumLoading(true);
      const response = await fetch('/api/portfolio/albums', {
        method: 'POST',
        headers: buildAuthHeaders(),
        body: JSON.stringify({ nombre, descripcion }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'No se pudo crear el álbum');
      }

      const createdAlbum: Album = await response.json();
      return createdAlbum;
    } catch (error) {
      console.error('Error creando álbum:', error);
      setMessage({ type: 'error', text: error instanceof Error ? error.message : 'Error al crear álbum' });
      return null;
    } finally {
      setAlbumLoading(false);
    }
  }, [buildAuthHeaders]);

  const fetchCategories = useCallback(async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const data: Category[] = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Error al cargar categorías:', error);
    }
  }, []);

  const fetchProfile = useCallback(async () => {
    if (!user?.id) {
      return;
    }

    try {
      setLoadingProfile(true);
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      const response = await fetch(`/api/profiles?usuarioId=${user.id}`, {
        headers,
      });

      if (response.ok) {
        const data: PhotographerProfile | PhotographerProfile[] = await response.json();
        const userProfile = Array.isArray(data)
          ? data.find((p) => p.usuarioId === user.id)
          : data;

        if (userProfile) {
          setProfile(userProfile);
          setFormData({
            nombrePublico: userProfile.nombrePublico || '',
            biografia: userProfile.biografia || '',
            ubicacion: userProfile.ubicacion || '',
            sitioWeb: userProfile.sitioWeb || '',
            urlFotoPerfil: userProfile.urlFotoPerfil || '',
            urlFotoPortada: userProfile.urlFotoPortada || '',
            urlDocumentoIdentidad: userProfile.urlDocumentoIdentidad || '',
            qrPagoUrl: userProfile.qrPagoUrl || '',
            qrInstrucciones: userProfile.qrInstrucciones || '',
          });

          const normalizedAlbums = (userProfile.albums || []).map((album) => ({
            ...album,
            imagenes: album.imagenes?.map((img) => ({
              ...img,
              albumId: img.albumId ?? album.id,
              album: img.album ?? album.nombre,
            })) || [],
          }));

          const normalizedPortfolio = (userProfile.portafolio || []).map((img) => {
            const match = normalizedAlbums.find((album) => album.id === img.albumId || album.nombre === img.album);
            return {
              ...img,
              albumId: match?.id ?? img.albumId ?? null,
              album: match?.nombre ?? img.album ?? DEFAULT_ALBUM,
            };
          });

          setPortfolioImages(normalizedPortfolio);

          if (normalizedAlbums.length > 0) {
            setAlbums(normalizedAlbums);
            setSelectedAlbumId((prev) =>
              prev && normalizedAlbums.some((album) => album.id === prev)
                ? prev
                : normalizedAlbums[0]?.id ?? null
            );
          } else if (!attemptedAlbumBootstrap.current && userProfile.id) {
            attemptedAlbumBootstrap.current = true;
            await createAlbumOnServer(DEFAULT_ALBUM, 'Tus sesiones más representativas');
            await fetchProfile();
            return;
          } else {
            setAlbums([]);
            setSelectedAlbumId(null);
          }
        }
      }
    } catch (error) {
      console.error('Error al cargar perfil:', error);
    } finally {
      setLoadingProfile(false);
    }
  }, [createAlbumOnServer, getAuthToken, user?.id]);

  useEffect(() => {
    if (profile?.categorias) {
      const ids = profile.categorias.map((cat) => cat.categoriaId);
      setSelectedCategories(ids);
    }
  }, [profile]);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
    if (!loading && user && user.rol !== 'FOTOGRAFO') {
      router.push('/dashboard');
    }
    if (user?.rol === 'FOTOGRAFO') {
      fetchProfile();
    }
  }, [user, loading, router, fetchProfile]);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const handleToggleCategory = (categoryId: number) => {
    setSelectedCategories((prev) => {
      const isSelected = prev.includes(categoryId);
      if (isSelected) {
        return prev.filter((id) => id !== categoryId);
      }

      if (prev.length >= 6) {
        setMessage({ type: 'error', text: 'Solo puedes seleccionar hasta 6 categorías' });
        return prev;
      }

      return [...prev, categoryId];
    });
  };

  const handleSaveCategories = async () => {
    if (!profile) return;
    try {
      setSavingCategories(true);
      const token = getAuthToken();
      const response = await fetch('/api/photographer-categories', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fotografoId: profile.id,
          categoriaIds: selectedCategories,
        }),
      });

      if (response.ok) {
        setMessage({ type: 'success', text: '✅ Categorías actualizadas' });
        fetchProfile();
      } else {
        setMessage({ type: 'error', text: '❌ Error al guardar categorías' });
      }
    } catch (error) {
      console.error('Error guardando categorías:', error);
      setMessage({ type: 'error', text: '❌ Error al guardar categorías' });
    } finally {
      setSavingCategories(false);
    }
  };

  const handleCreateAlbum = async () => {
    if (!profile) return;
    const trimmed = safeTrim(albumForm.nombre);
    if (!trimmed) return;

    const duplicated = albums.some(
      (album) => album.nombre.toLowerCase() === trimmed.toLowerCase()
    );

    if (duplicated) {
      setMessage({ type: 'error', text: 'Este nombre de álbum ya existe' });
      return;
    }

  const created = await createAlbumOnServer(trimmed, safeTrim(albumForm.descripcion));

    if (created) {
      setAlbums((prev) => [...prev, created]);
      setSelectedAlbumId(created.id);
      setAlbumForm({ nombre: '', descripcion: '' });
      setMessage({ type: 'success', text: 'Álbum creado correctamente' });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      setSaving(true);
      setMessage({ type: '', text: '' });
      
      const token = getAuthToken();
      
      if (profile) {
        // Actualizar perfil existente
        const response = await fetch(`/api/profiles/${profile.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(formData),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: '✅ Perfil profesional actualizado correctamente' });
          fetchProfile();
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: `❌ ${error.message || 'Error al actualizar'}` });
        }
      } else {
        // Crear nuevo perfil
        const response = await fetch('/api/profiles', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...formData,
            usuarioId: user?.id,
          }),
        });

        if (response.ok) {
          setMessage({ type: 'success', text: '✅ Perfil profesional creado correctamente' });
          fetchProfile();
        } else {
          const error = await response.json();
          setMessage({ type: 'error', text: `❌ ${error.message || 'Error al crear'}` });
        }
      }
    } catch (error) {
      console.error('Error al guardar el perfil del fotógrafo:', error);
      setMessage({ type: 'error', text: '❌ Error al guardar el perfil' });
    } finally {
      setSaving(false);
    }
  };

  const handleAddImage = async (customUrl?: string) => {
    if (!profile) return false;
    const baseOrigin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';
    const rawUrl = safeTrim(customUrl ?? newImage.url);

    if (!rawUrl) {
      setMessage({ type: 'error', text: '❌ Necesitas ingresar la URL pública de la foto' });
      return false;
    }

    let urlToUse = rawUrl;
    if (!/^https?:\/\//i.test(rawUrl) && !rawUrl.startsWith('/')) {
      urlToUse = `https://${rawUrl}`;
    }

    try {
      new URL(urlToUse, baseOrigin);
    } catch (error) {
      console.error('URL inválida para el portafolio:', error);
      setMessage({ type: 'error', text: '❌ Ingresa un enlace válido (http/https o ruta /uploads)' });
      return false;
    }

    try {
      const token = getAuthToken();
      const response = await fetch('/api/portfolio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          fotografoId: profile.id,
          urlImagen: urlToUse,
          descripcion: newImage.descripcion,
          orden: portfolioImages.length + 1,
          destacada: false,
          albumId: selectedAlbum?.id,
          albumName: selectedAlbum?.nombre ?? DEFAULT_ALBUM,
        }),
      });

      if (response.ok) {
        setNewImage({ url: '', descripcion: '' });
        fetchProfile();
        setMessage({ type: 'success', text: '✅ Imagen agregada al portafolio' });
        return true;
      } else {
        setMessage({ type: 'error', text: '❌ Error al agregar imagen' });
      }
    } catch (error) {
      console.error('Error al agregar imagen al portafolio:', error);
      setMessage({ type: 'error', text: '❌ Error al agregar imagen' });
    }
    return false;
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setImageFile(file);
  };

  const handleProfileFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setProfilePhotoFile(event.target.files?.[0] || null);
  };

  const handleCoverFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCoverPhotoFile(event.target.files?.[0] || null);
  };

  const handleDocumentFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDocumentFile(event.target.files?.[0] || null);
  };

  const handleUploadImage = async () => {
    if (!imageFile) return;
    try {
      setUploadingImage(true);
      const formData = new FormData();
      formData.append('file', imageFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        setMessage({ type: 'error', text: '❌ Error al subir la imagen. Verifica el formato y tamaño.' });
        return;
      }

      const data = await response.json();
      const added = await handleAddImage(data.url);
      if (added) {
        setMessage({ type: 'success', text: '✅ Imagen subida y agregada al portafolio' });
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      setMessage({ type: 'error', text: '❌ Error al subir la imagen' });
    } finally {
      setUploadingImage(false);
      setImageFile(null);
    }
  };

  const handleQrFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setQrFile(file);
  };

  const handleUploadQrImage = async () => {
    if (!qrFile) return;
    try {
      setUploadingQr(true);
      const uploadData = new FormData();
      uploadData.append('file', qrFile);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (!response.ok) {
        setMessage({ type: 'error', text: '❌ Error al subir tu QR. Intenta con JPG/PNG menor a 8MB.' });
        return;
      }

      const data = await response.json();
      const url = data?.url;
      if (url) {
        setFormData((prev) => ({ ...prev, qrPagoUrl: url }));
        setMessage({ type: 'success', text: '✅ QR actualizado correctamente' });
      }
    } catch (error) {
      console.error('Error uploading QR image:', error);
      setMessage({ type: 'error', text: '❌ Error al subir el QR' });
    } finally {
      setUploadingQr(false);
      setQrFile(null);
    }
  };

  const uploadVisualAsset = async (
    file: File,
    targetField: 'urlFotoPerfil' | 'urlFotoPortada',
    onComplete?: () => void
  ) => {
    try {
      const form = new FormData();
      form.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: form,
      });

      if (!response.ok) {
        throw new Error('Error al subir la imagen. Usa JPG/PNG/WebP menores a 8MB.');
      }

      const data = await response.json();
      if (data?.url) {
        setFormData((prev) => ({ ...prev, [targetField]: data.url }));
        setMessage({
          type: 'success',
          text:
            targetField === 'urlFotoPerfil'
              ? '✅ Foto de perfil actualizada'
              : '✅ Foto de portada actualizada',
        });
        onComplete?.();
      }
    } catch (error) {
      console.error('Error al subir imagen de perfil/portada:', error);
      setMessage({ type: 'error', text: '❌ No se pudo subir la imagen seleccionada' });
    }
  };

  const handleUploadProfilePhoto = async () => {
    if (!profilePhotoFile) return;
    try {
      setUploadingProfilePhoto(true);
      await uploadVisualAsset(profilePhotoFile, 'urlFotoPerfil', () => setProfilePhotoFile(null));
    } finally {
      setUploadingProfilePhoto(false);
    }
  };

  const handleUploadCoverPhoto = async () => {
    if (!coverPhotoFile) return;
    try {
      setUploadingCoverPhoto(true);
      await uploadVisualAsset(coverPhotoFile, 'urlFotoPortada', () => setCoverPhotoFile(null));
    } finally {
      setUploadingCoverPhoto(false);
    }
  };

  const handleUploadDocument = async () => {
    if (!documentFile) return;
    try {
    setUploadingDocument(true);
    const form = new FormData();
    form.append('file', documentFile);

    const response = await fetch('/api/upload', {
    method: 'POST',
    body: form,
    });

    if (!response.ok) {
    throw new Error('Error al subir el documento. Usa JPG/PNG/PDF menores a 8MB.');
    }

    const data = await response.json();
    if (data?.url) {
    setFormData((prev) => ({ ...prev, urlDocumentoIdentidad: data.url }));
    setMessage({ type: 'success', text: '✅ Documento de identidad subido correctamente' });
    setDocumentFile(null);
    }
    } catch (error) {
    console.error('Error al subir documento:', error);
    setMessage({ type: 'error', text: '❌ No se pudo subir el documento' });
    } finally {
    setUploadingDocument(false);
    }
  };

  const handleDeleteImage = async (imageId: number) => {
    if (!confirm('¿Eliminar esta imagen del portafolio?')) return;

    try {
      const token = getAuthToken();
      const response = await fetch(`/api/portfolio/${imageId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        fetchProfile();
        setMessage({ type: 'success', text: '✅ Imagen eliminada' });
      }
    } catch (error) {
      console.error('Error al eliminar imagen del portafolio:', error);
      setMessage({ type: 'error', text: '❌ Error al eliminar imagen' });
    }
  };

  if (loading || loadingProfile) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="text-6xl mb-4">⏳</div>
          <p className="text-gray-600">Cargando...</p>
        </div>
      </div>
    );
  }

  if (!user || user.rol !== 'FOTOGRAFO') {
    return null;
  }

  const completedFields = [
    formData.nombrePublico,
    formData.biografia,
    formData.ubicacion,
    formData.sitioWeb,
    formData.urlFotoPerfil,
    formData.urlFotoPortada,
    formData.qrPagoUrl,
  ].filter(Boolean).length;
  const profileProgress = Math.round((completedFields / 7) * 100);
  const packagesCount = profile?.paquetes?.length || 0;
  const portfolioCount = portfolioImages.length;
  const albumsCount = albums.length;
  const selectedAlbum = selectedAlbumId
    ? albums.find((album) => album.id === selectedAlbumId) || null
    : albums[0] || null;

  const filteredImages = selectedAlbum
    ? portfolioImages.filter((img) => {
        if (img.albumId) {
          return img.albumId === selectedAlbum.id;
        }
        return (img.album || DEFAULT_ALBUM) === selectedAlbum.nombre;
      })
    : portfolioImages;

  const statusBadges = [
    { label: 'Álbumes curados', value: albumsCount, icon: '📁' },
    { label: 'Portafolio', value: `${portfolioCount} imágenes`, icon: '🖼️' },
    { label: 'Paquetes activos', value: packagesCount, icon: '📦' },
    { label: 'Reservas recibidas', value: profile?.totalReservas || 0, icon: '📅' },
  ];

  return (
    <div className="bg-slate-50 min-h-screen py-10">
      <div className="container mx-auto px-4 max-w-6xl space-y-10">
        <section className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl text-white p-8 shadow-xl">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="uppercase tracking-[0.4em] text-white/70 text-xs">Perfil profesional</p>
              <h1 className="text-4xl font-semibold mt-4">{formData.nombrePublico || 'Tu marca fotográfica'}</h1>
              <p className="text-white/80 mt-2 max-w-2xl">
                Actualiza tu biografía, imágenes y portafolio para aparecer destacado en las búsquedas de FotoBolivia.
              </p>
              <div className="mt-6">
                <div className="h-2 bg-white/30 rounded-full">
                  <div className="h-full bg-white rounded-full" style={{ width: `${profileProgress}%` }}></div>
                </div>
                <p className="text-sm text-white/80 mt-2">Perfil completado {profileProgress}%</p>
              </div>
            </div>
            <div className="grid sm:grid-cols-3 gap-4">
              {statusBadges.map((item) => (
                <div key={item.label} className="bg-white/10 rounded-2xl p-4 text-center">
                  <p className="text-3xl">{item.icon}</p>
                  <p className="text-lg font-semibold">{item.value}</p>
                  <p className="text-sm text-white/70">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {message.text && (
          <div
            className={`p-4 rounded-2xl ${
              message.type === 'success'
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-100'
                : 'bg-rose-50 text-rose-700 border border-rose-100'
            }`}
          >
            {message.text}
          </div>
        )}

        {/* Botón de Destacar Perfil */}
        {profile && (
          <Card className="bg-gradient-to-r from-yellow-50 to-orange-50 border-yellow-200">
            <div className="p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-2xl">⭐</span>
                    <h3 className="text-xl font-bold text-gray-900">Destaca tu Perfil</h3>
                  </div>
                  <p className="text-gray-700 text-sm sm:text-base">
                    Aumenta tu visibilidad y recibe más reservas apareciendo en los primeros resultados. 
                    <strong className="text-orange-700"> Desde Bs 100 por semana.</strong>
                  </p>
                  {profile.destacadoHasta && new Date(profile.destacadoHasta) > new Date() && (
                    <p className="text-green-700 font-semibold mt-2 text-sm">
                      ✓ Tu perfil está destacado hasta el {new Date(profile.destacadoHasta).toLocaleDateString('es-ES')}
                    </p>
                  )}
                </div>
                <Button
                  onClick={() => router.push('/destacar-perfil')}
                  className="bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white font-semibold px-6 py-3 whitespace-nowrap"
                >
                  {profile.destacadoHasta && new Date(profile.destacadoHasta) > new Date() 
                    ? 'Renovar Destacado'
                    : 'Destacar Ahora'
                  }
                </Button>
              </div>
            </div>
          </Card>
        )}

        <div className="grid lg:grid-cols-[2fr_1fr] gap-8">
          <div className="space-y-8">
            <Card padding="lg" className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">Identidad pública</p>
                <h2 className="text-2xl font-semibold text-slate-900 mt-1">Información principal</h2>
              </div>
              <form onSubmit={handleSubmit} className="space-y-5">
                <Input
                  label="Nombre del estudio"
                  value={formData.nombrePublico}
                  onChange={(val) => setFormData({ ...formData, nombrePublico: val })}
                  placeholder="Ej: Prisma Visual Studio"
                  required
                />
                <div className="grid md:grid-cols-2 gap-5">
                  <Input
                    label="Ubicación principal"
                    value={formData.ubicacion}
                    onChange={(val) => setFormData({ ...formData, ubicacion: val })}
                    placeholder="La Paz, Santa Cruz..."
                    required
                  />
                  <Input
                    label="Sitio web"
                    type="url"
                    value={formData.sitioWeb}
                    onChange={(val) => setFormData({ ...formData, sitioWeb: val })}
                    placeholder="https://tumarca.com"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Biografía</label>
                  <textarea
                    value={formData.biografia}
                    onChange={(e) => setFormData({ ...formData, biografia: e.target.value })}
                    rows={6}
                    placeholder="Comparte tu propuesta de valor, experiencia y estilo fotográfico."
                    className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-5">
                  <Input
                    label="URL de foto de perfil"
                    type="url"
                    value={formData.urlFotoPerfil}
                    onChange={(val) => setFormData({ ...formData, urlFotoPerfil: val })}
                    placeholder="https://...perfil.jpg"
                  />
                  <Input
                    label="URL de portada"
                    type="url"
                    value={formData.urlFotoPortada}
                    onChange={(val) => setFormData({ ...formData, urlFotoPortada: val })}
                    placeholder="https://...cover.jpg"
                  />
                </div>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Vista previa foto de perfil</p>
                    <div className="relative h-48 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {formData.urlFotoPerfil ? (
                        <img
                          src={formData.urlFotoPerfil}
                          alt="Foto de perfil"
                          loading="lazy"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="text-slate-400 text-center space-y-2">
                          <p className="text-4xl">🪪</p>
                          <p className="text-sm">Añade una imagen cuadrada (mín. 400x400)</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleProfileFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                      />
                      {profilePhotoFile && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
                          <span>
                            {profilePhotoFile.name} · {(profilePhotoFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button onClick={handleUploadProfilePhoto} disabled={uploadingProfilePhoto}>
                            {uploadingProfilePhoto ? 'Subiendo...' : 'Usar esta foto'}
                          </Button>
                        </div>
                      )}
                      {formData.urlFotoPerfil && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData((prev) => ({ ...prev, urlFotoPerfil: '' }))}
                        >
                          Quitar foto
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <p className="text-sm font-semibold text-slate-700">Vista previa portada</p>
                    <div className="relative h-48 md:h-60 rounded-2xl border border-slate-200 bg-slate-50 overflow-hidden flex items-center justify-center">
                      {formData.urlFotoPortada ? (
                        <img
                          src={formData.urlFotoPortada}
                          alt="Foto de portada"
                          loading="lazy"
                          className="max-h-full max-w-full object-contain"
                        />
                      ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 space-y-2">
                          <p className="text-4xl">🖼️</p>
                          <p className="text-sm">Recomendado 1600x600 px</p>
                        </div>
                      )}
                    </div>
                    <div className="space-y-3">
                      <input
                        type="file"
                        accept="image/png,image/jpeg,image/webp"
                        onChange={handleCoverFileChange}
                        className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100"
                      />
                      {coverPhotoFile && (
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
                          <span>
                            {coverPhotoFile.name} · {(coverPhotoFile.size / 1024 / 1024).toFixed(2)} MB
                          </span>
                          <Button onClick={handleUploadCoverPhoto} disabled={uploadingCoverPhoto}>
                            {uploadingCoverPhoto ? 'Subiendo...' : 'Usar como portada'}
                          </Button>
                        </div>
                      )}
                      {formData.urlFotoPortada && (
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => setFormData((prev) => ({ ...prev, urlFotoPortada: '' }))}
                        >
                          Quitar portada
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="flex flex-wrap gap-3 justify-end">
                  <Button type="button" variant="outline" onClick={fetchProfile}>
                    Descartar cambios
                  </Button>
                  <Button type="submit" variant="primary" size="lg" disabled={saving}>
                    {saving ? 'Guardando...' : profile ? 'Actualizar Perfil' : 'Crear Perfil'}
                  </Button>
                </div>
              </form>
            </Card>

            <Card padding="lg" className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">Pagos vía QR o transferencia</p>
                <h2 className="text-2xl font-semibold text-slate-900 mt-1">Configura tu comprobante de pago</h2>
                <p className="text-sm text-slate-500">
                  Sube la imagen del QR (o captura de tus datos bancarios) e indica instrucciones para que los clientes puedan
                  enviarte el comprobante correcto.
                </p>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm font-medium text-slate-700 mb-2">Vista previa del QR</p>
                  <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-6">
                    {formData.qrPagoUrl ? (
                      <div className="relative h-64 rounded-2xl overflow-hidden bg-white flex items-center justify-center">
                        <img
                          src={formData.qrPagoUrl}
                          alt="QR de pago"
                          loading="lazy"
                          className="max-h-full max-w-full object-contain"
                        />
                      </div>
                    ) : (
                      <div className="h-64 flex flex-col items-center justify-center text-slate-400 gap-2">
                        <span className="text-4xl">📲</span>
                        <p className="font-semibold">Aún no cargas un QR</p>
                        <p className="text-sm text-center">Tus clientes verán aquí tu medio de pago</p>
                      </div>
                    )}
                  </div>
                  {formData.qrPagoUrl && (
                    <div className="flex flex-wrap gap-3 mt-4">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => setFormData((prev) => ({ ...prev, qrPagoUrl: '' }))}
                      >
                        Eliminar QR
                      </Button>
                      <a
                        href={formData.qrPagoUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="px-4 py-2 rounded-full border text-sm border-slate-300 text-slate-600 hover:border-slate-400"
                      >
                        Abrir en pestaña nueva
                      </a>
                    </div>
                  )}
                </div>

                <div className="space-y-5">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subir archivo</label>
                    <input
                      type="file"
                      accept="image/png,image/jpeg,image/webp"
                      onChange={handleQrFileChange}
                      className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-emerald-50 file:text-emerald-600 hover:file:bg-emerald-100"
                    />
                    {qrFile && (
                      <div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600">
                        <span>
                          {qrFile.name} · {(qrFile.size / 1024 / 1024).toFixed(2)} MB
                        </span>
                        <Button onClick={handleUploadQrImage} disabled={uploadingQr}>
                          {uploadingQr ? 'Subiendo...' : 'Actualizar QR'}
                        </Button>
                      </div>
                    )}
                    <p className="text-xs text-slate-500 mt-2">Formatos admitidos: JPG, PNG o WebP (máx. 8MB)</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Instrucciones para tus clientes</label>
                    <textarea
                      value={formData.qrInstrucciones}
                      onChange={(event) => setFormData((prev) => ({ ...prev, qrInstrucciones: event.target.value }))}
                      rows={6}
                      placeholder="Ej. Transferir a Banco Unión, enviar comprobante con nombre completo y número de evento."
                      className="w-full rounded-2xl border border-slate-200 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="text-xs text-slate-500 mt-1">Se mostrará cuando el cliente cargue su comprobante desde Mis Reservas.</p>
                  </div>
                </div>
              </div>
            </Card>

            <Card padding="lg" className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">Especialidades</p>
                <h2 className="text-2xl font-semibold text-slate-900 mt-1">Categorías en las que destacas</h2>
                <p className="text-sm text-slate-500">Selecciona hasta 6 categorías para mejorar tu posicionamiento en las búsquedas.</p>
              </div>

              <div className="grid sm:grid-cols-2 gap-4">
                {categories.map((category) => {
                  const active = selectedCategories.includes(category.id);
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => handleToggleCategory(category.id)}
                      className={`flex items-start gap-3 text-left rounded-2xl border p-4 transition ${
                        active
                          ? 'border-blue-500 bg-blue-50 text-blue-900'
                          : 'border-slate-200 hover:border-slate-300'
                      }`}
                    >
                      <span className="text-2xl">
                        {category.icono || (active ? '⭐' : '🎯')}
                      </span>
                      <div className="space-y-1">
                        <p className="font-semibold">{category.nombre}</p>
                        <p className="text-sm text-slate-500">
                          {category.descripcion || 'Categoría destacada en la plataforma'}
                        </p>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-sm text-slate-500">
                  {selectedCategories.length} categorías seleccionadas
                </p>
                <div className="flex gap-3">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setSelectedCategories(profile?.categorias?.map((c) => c.categoriaId) || [])}
                  >
                    Restablecer
                  </Button>
                  <Button onClick={handleSaveCategories} disabled={savingCategories}>
                    {savingCategories ? 'Guardando...' : 'Guardar categorías'}
                  </Button>
                </div>
              </div>

            <Card padding="lg" className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">Verificación de identidad</p>
                <h2 className="text-2xl font-semibold text-slate-900 mt-1">Solicita verificación oficial</h2>
                <p className="text-sm text-slate-500">
                  Sube tu documento de identidad (CI, Pasaporte) para recibir el badge de verificado.
                </p>
              </div>

              {profile?.verificado ? (
                <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-6 text-center">
                  <div className="text-5xl mb-3"></div>
                  <p className="text-lg font-bold text-green-900">Perfil Verificado!</p>
                  <p className="text-sm text-green-700 mt-2">Tu perfil cuenta con el badge oficial.</p>
                </div>
              ) : formData.urlDocumentoIdentidad ? (
                <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-6 text-center">
                  <div className="text-5xl mb-3"></div>
                  <p className="text-lg font-bold text-amber-900">Solicitud en revisión</p>
                  <p className="text-sm text-amber-700 mt-2">Te notificaremos pronto.</p>
                  <a href={formData.urlDocumentoIdentidad} target="_blank" rel="noreferrer" className="inline-block mt-3 text-sm text-blue-600 hover:underline">Ver documento</a>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="border-2 border-dashed border-slate-200 rounded-2xl p-6 bg-slate-50">
                    <label className="block text-sm font-medium text-slate-700 mb-2">Subir documento</label>
                    <input type="file" accept="image/png,image/jpeg,image/webp,application/pdf" onChange={handleDocumentFileChange} className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-purple-50 file:text-purple-600 hover:file:bg-purple-100" />
                    {documentFile && (<div className="mt-3 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between text-sm text-slate-600"><span>{documentFile.name}  {(documentFile.size / 1024 / 1024).toFixed(2)} MB</span><Button onClick={handleUploadDocument} disabled={uploadingDocument}>{uploadingDocument ? "Subiendo..." : "Enviar para verificación"}</Button></div>)}
                    <p className="text-xs text-slate-500 mt-2">Formatos: JPG, PNG, PDF (máx. 8MB)</p>
                  </div>
                  <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 text-sm text-blue-800">
                    <p className="font-semibold mb-2">Por qué verificar?</p>
                    <ul className="space-y-1 list-disc list-inside"><li>Badge visible</li><li>Más confianza</li><li>Prioridad en búsquedas</li></ul>
                  </div>
                </div>
              )}
            </Card>


            </Card>

            <Card padding="lg" className="space-y-6">
              <div>
                <p className="text-sm font-semibold text-blue-600">Portafolio</p>
                <h2 className="text-2xl font-semibold text-slate-900 mt-1">Organizar galería</h2>
                <p className="text-sm text-slate-500">Comparte piezas representativas. Prioriza colecciones recientes y proyectos icónicos.</p>
              </div>

              <div className="border-2 border-dashed border-slate-200 rounded-3xl p-6 bg-slate-50 space-y-6">
                <div>
                  <label className="block text-sm font-semibold text-slate-700 mb-2">Subir imagen desde tu equipo</label>
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={handleFileChange}
                    className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-600 hover:file:bg-blue-100"
                  />
                  {imageFile && (
                    <div className="mt-3 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm text-slate-600">
                        {imageFile.name} · {(imageFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                      <Button onClick={handleUploadImage} disabled={uploadingImage}>
                        {uploadingImage ? 'Subiendo...' : 'Subir y agregar'}
                      </Button>
                    </div>
                  )}
                  <p className="text-xs text-slate-500 mt-2">Formatos permitidos: JPG, PNG, WebP (máx. 8MB)</p>
                </div>

                <div className="space-y-3">
                  <p className="text-sm font-semibold text-slate-700">Álbum seleccionado</p>
                  <div className="flex flex-wrap gap-2">
                    {albums.map((album) => (
                      <button
                        key={album.id}
                        type="button"
                        onClick={() => setSelectedAlbumId(album.id)}
                        className={`px-4 py-2 rounded-full text-sm border transition ${
                          selectedAlbum?.id === album.id
                            ? 'bg-blue-600 text-white border-blue-600'
                            : 'border-slate-200 text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        {album.nombre}
                      </button>
                    ))}
                  </div>
                  <div className="grid md:grid-cols-[2fr_1fr] gap-3">
                    <Input
                      label="Crear nuevo álbum"
                      value={albumForm.nombre}
                      onChange={(val) =>
                        setAlbumForm((prev) => ({ ...prev, nombre: val }))
                      }
                      placeholder="Ej: Bodas 2025"
                    />
                    <Button
                      type="button"
                      onClick={handleCreateAlbum}
                      disabled={!safeTrim(albumForm.nombre) || albumLoading}
                      className="h-full"
                    >
                      Crear álbum
                    </Button>
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-4">
                  <Input
                    label="URL pública de la foto"
                    type="url"
                    value={newImage.url}
                    onChange={(val) => setNewImage({ ...newImage, url: val })}
                    placeholder="https://images..."
                  />
                  <Input
                    label="Descripción / cliente"
                    value={newImage.descripcion}
                    onChange={(val) => setNewImage({ ...newImage, descripcion: val })}
                    placeholder="Boda Andrea & Luis, La Paz"
                  />
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <p className="text-sm text-slate-500">Formato recomendado: 1600x1200px (JPEG/PNG)</p>
                  <Button onClick={() => handleAddImage()} disabled={!safeTrim(newImage.url)}>
                    + Agregar imagen
                  </Button>
                </div>
              </div>

              {portfolioImages.length === 0 ? (
                <div className="text-center py-16 text-slate-400 border border-dashed border-slate-200 rounded-3xl">
                  <p className="text-4xl mb-4">📷</p>
                  <p className="font-semibold">Aún no tienes fotos cargadas</p>
                  <p className="text-sm">Agrega al menos 6 imágenes para activar tu perfil público</p>
                </div>
              ) : filteredImages.length === 0 ? (
                <div className="text-center py-12 text-slate-400 border border-dashed border-slate-200 rounded-3xl">
                  <p className="text-4xl mb-2">📁</p>
                  <p className="font-semibold">Sin imágenes en este álbum</p>
                  <p className="text-sm">Selecciona otro álbum o agrega nuevas imágenes.</p>
                </div>
              ) : (
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {filteredImages.map((img) => (
                    <div
                      key={img.id}
                      className="relative group rounded-3xl overflow-hidden aspect-[4/3] bg-slate-900/80 flex items-center justify-center"
                    >
                      <img
                        src={img.urlImagen}
                        alt={img.descripcion || 'Portafolio'}
                        loading="lazy"
                        className="w-full h-full object-contain transition duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition flex flex-col justify-end p-4">
                        <p className="text-white text-sm line-clamp-2">{img.descripcion || 'Proyecto destacado'}</p>
                        <p className="text-white/80 text-xs">{img.album || DEFAULT_ALBUM}</p>
                        <Button
                          variant="outline"
                          size="sm"
                          className="mt-2 border-white text-white hover:bg-white/10"
                          onClick={() => handleDeleteImage(img.id)}
                        >
                          Eliminar
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
          <div className="space-y-6">
            <Card padding="lg" className="space-y-5">
              <div>
                <p className="text-sm font-semibold text-blue-600">Visibilidad</p>
                <h3 className="text-xl font-semibold text-slate-900">Checklist rápido</h3>
                <p className="text-sm text-slate-500">Optimiza tu perfil para aparecer en los primeros lugares.</p>
              </div>
              <ul className="space-y-3 text-sm text-slate-600">
                <li>✓ Nombre público claro y fácil de recordar</li>
                <li>✓ Ubicación y ciudad principal configuradas</li>
                <li>✓ Biografía con propuesta única de valor</li>
                <li>✓ Portafolio con mínimo 6 proyectos</li>
                <li>✓ Paquetes visibles en la sección servicios</li>
              </ul>
              <Link href="/mis-paquetes">
                <Button variant="outline" className="w-full">Gestionar paquetes</Button>
              </Link>
            </Card>

            <Card padding="lg" className="bg-slate-900 text-white space-y-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/60">Tips del equipo</p>
              <p className="text-lg font-semibold">Destaca temporadas, estilos y diferenciales competitivos.</p>
              <ul className="space-y-2 text-sm text-white/80">
                <li>• Incluye tono de marca y estilo fotográfico.</li>
                <li>• Comparte tiempos de entrega y coberturas.</li>
                <li>• Actualiza portafolio cada proyecto clave.</li>
              </ul>
            </Card>
          </div>
        </div>

        <Card className="bg-gradient-to-br from-blue-100 to-purple-100 border-none">
          <div className="p-6">
            <h3 className="font-bold text-lg mb-3">💡 Consejos de conversión</h3>
            <ul className="space-y-2 text-sm text-slate-700">
              <li>✓ Usa fotos de alta calidad en tu portafolio</li>
              <li>✓ Personaliza tus paquetes con lo que incluye cada uno</li>
              <li>✓ Responde solicitudes en menos de 2 horas</li>
              <li>✓ Comparte reseñas y casos de éxito en la bio</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
